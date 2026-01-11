import React, { useState } from 'react';
import { Copy, Check, FileCode, Terminal, FileJson, FileCog, Wifi, Database } from 'lucide-react';

const files = [
  {
    name: 'unity_bridge.py',
    language: 'python',
    icon: Wifi,
    content: `import socket
import json
import traci
import sumolib
import time
import math
import random
import torch
from agent import DQNAgent
from sumo_env import TrafficSignalEnv

# Configuration
HOST = '127.0.0.1'
PORT = 4042
ADAPTIVE_MODE = True

def get_intersection_state(ts_id):
    """Calculates density in all directions for the AI Agent state space"""
    lanes = traci.trafficlight.getControlledLanes(ts_id)
    state = []
    for lane in lanes:
        queue = traci.lane.getLastStepHaltingNumber(lane)
        density = traci.lane.getLastStepOccupancy(lane)
        state.extend([queue, density])
    return state

def run_bridge():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((HOST, PORT))
    server.listen(1)
    print(f"[AI-BRIDGE] Syncing with OSM Topology... Port {PORT}")
    
    conn, addr = server.accept()
    
    env = TrafficSignalEnv(
        net_file='networks/city_central.net.xml',
        route_file='networks/city_demand.rou.xml',
        use_gui=False
    )
    
    # Load MADQN Agent
    agent = DQNAgent(state_dim=env.observation_space.shape[0], action_dim=env.action_space.n)
    agent.model.load_state_dict(torch.load("models/adaptive_v1.pth"))

    try:
        while True:
            sim_time = traci.simulation.getTime()
            
            # 1. Capture Real-Time State (Density Analysis)
            state = get_intersection_state(env.ts_id)
            
            # 2. AI Adaptive Decision
            if ADAPTIVE_MODE:
                action = agent.act(state)
                env.step(action) # Applies timing optimization
            
            # 3. Stream Results to Unity Visualizer
            vehicle_data = []
            for veh_id in traci.vehicle.getIDList():
                pos = traci.vehicle.getPosition(veh_id)
                vehicle_data.append({
                    "id": veh_id,
                    "x": pos[0], "y": pos[1],
                    "angle": traci.vehicle.getAngle(veh_id),
                    "speed": traci.vehicle.getSpeed(veh_id)
                })

            payload = {
                "timestamp": sim_time,
                "vehicles": vehicle_data,
                "signal_state": traci.trafficlight.getRedYellowGreenState(env.ts_id),
                "ai_metrics": {
                    "reward": env.last_reward,
                    "avg_wait": traci.simulation.getArrivedNumber() # simplified
                }
            }

            conn.sendall((json.dumps(payload) + "\n").encode('utf-8'))
            time.sleep(0.05) 

    except Exception as e:
        print(f"Connection Lost: {e}")
    finally:
        conn.close()
        traci.close()`
  },
  {
    name: 'agent.py',
    language: 'python',
    icon: Terminal,
    content: `import torch
import torch.nn as nn
import torch.optim as optim
import random
import numpy as np

class MADQN_Network(nn.Module):
    """Neural Network for Traffic Signal Optimization"""
    def __init__(self, state_dim, action_dim):
        super(MADQN_Network, self).__init__()
        self.fc = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim)
        )

    def forward(self, x):
        return self.fc(x)

class DQNAgent:
    def __init__(self, state_dim, action_dim):
        self.model = MADQN_Network(state_dim, action_dim)
        self.epsilon = 0.1

    def act(self, state):
        """Predicts optimal phase based on current lane density"""
        if random.random() < self.epsilon:
            return random.randint(0, 3) # Explore
        
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        q_values = self.model(state_tensor)
        return torch.argmax(q_values).item()`
  }
];

export const CodeRepository: React.FC = () => {
  const [activeFile, setActiveFile] = useState(files[0]);
  const [copied, setCopied] = useState(false);

  return (
    <div className="p-8 ml-64 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Adaptive Signal Control Source</h2>
        <p className="text-slate-600 mt-2">Implementation of the MADQN-based density optimization system.</p>
      </div>

      <div className="flex h-[600px] border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-slate-900">
        <div className="w-64 bg-slate-800 flex-shrink-0 border-r border-slate-700">
          <div className="p-4 border-b border-slate-700"><h3 className="text-xs font-bold text-slate-400 uppercase">Core Logic</h3></div>
          <div className="p-2 space-y-1">
            {files.map((file) => (
              <button key={file.name} onClick={() => setActiveFile(file)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeFile.name === file.name ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                <file.icon size={16} />{file.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          <div className="flex justify-between items-center px-6 py-3 bg-[#252526] border-b border-[#333]">
            <span className="text-sm font-mono text-slate-300">{activeFile.name}</span>
            <button onClick={() => { navigator.clipboard.writeText(activeFile.content); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} className="text-xs text-slate-400 hover:text-white flex items-center gap-2">
                {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6 scrollbar-hide">
            <pre className="font-mono text-xs text-slate-300 leading-relaxed">{activeFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
