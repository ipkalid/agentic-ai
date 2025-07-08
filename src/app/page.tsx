'use client';
import { useState } from 'react';


import styles from './page.module.css';
import { createHRAgent } from '@/core/agents/hr-agent';
import { BaseAgent } from '@/core/agents/agent';
import { useRouter } from 'next/navigation';
import { createGeneralAgent } from '@/core/agents/general-agent';
import { createTravelAgent } from '@/core/agents/travel-agent';
import { getAppConfig } from '@/config/app-config';



export default function AgentSelection() {
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState<BaseAgent | null>(null);

  // Initialize agents at runtime to avoid build-time issues
  const agents: BaseAgent[] = [createGeneralAgent(getAppConfig()), createHRAgent(getAppConfig()), createTravelAgent(getAppConfig())];
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Select an Agent</h1>
          <p>Choose an AI assistant that best fits your needs</p>
        </div>

        <div className={styles.agentGrid}>
          {agents.map((agent) => (
            <div
              key={agent.getName()}
              className={`${styles.agentCard} ${selectedAgent?.getName() === agent.getName() ? styles.selected : ''}`}
              onClick={() => {
                setSelectedAgent(agent);
                router.push(`/${agent.getName()}`);

              }}
            >
              <div className={styles.agentAvatar}>🤖</div>
              <h3>{agent.getName()}</h3>
              <p>{agent.getName()}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
