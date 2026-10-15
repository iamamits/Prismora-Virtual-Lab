import { NextResponse } from 'next/server';
import { projectileMotionModel } from '@prismora/simulation-core';

export async function GET() {
  return NextResponse.json({
    platform: 'Prismora',
    tagline: 'Explore. Experiment. Understand.',
    version: '0.1.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    simulationEngine: {
      registeredModels: [
        {
          id: projectileMotionModel.id,
          name: projectileMotionModel.name,
          version: projectileMotionModel.version,
          status: 'ready',
        },
      ],
    },
    database: process.env.DATABASE_URL ? 'configured' : 'local-in-memory',
  });
}
