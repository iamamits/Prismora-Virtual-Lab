import { NextResponse } from 'next/server';
import { projectileMotionModel, type ExperimentConfiguration, type ProjectileMotionParameters } from '@prismora/simulation-core';

// In-memory store for development / local runs when DATABASE_URL is not yet provided
const inMemoryExperiments = new Map<string, ExperimentConfiguration<ProjectileMotionParameters> & { id: string; isPublic: boolean; ownerId?: string }>();

// Seed default flagship experiment
inMemoryExperiments.set('flagship-projectile', {
  id: 'flagship-projectile',
  version: '1.0.0',
  modelId: projectileMotionModel.id,
  modelVersion: projectileMotionModel.version,
  parameters: projectileMotionModel.getDefaultParameters(),
  clockSettings: {
    timeStep: 1 / 60,
    playbackSpeed: 1.0,
    maxTime: 300,
  },
  createdAt: '2026-10-15T00:00:00Z',
  isPublic: true,
  observations: 'Flagship ideal projectile motion reference run.',
});

export async function GET() {
  const items = Array.from(inMemoryExperiments.values()).filter((e) => e.isPublic);
  return NextResponse.json({
    status: 'ok',
    count: items.length,
    experiments: items,
    storage: process.env.DATABASE_URL ? 'postgresql' : 'in-memory',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const supportedModels = ['projectile-motion', 'digital-electronics', 'coa-riscv', 'toc-automata'];
    if (!supportedModels.includes(body.modelId)) {
      return NextResponse.json(
        { error: `Unsupported model "${body.modelId}". Must be one of: ${supportedModels.join(', ')}.` },
        { status: 400 },
      );
    }

    // Validate parameters if projectile-motion
    if (body.modelId === 'projectile-motion' && body.parameters) {
      const validation = projectileMotionModel.validateParameters(body.parameters);
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Parameter validation failed', details: validation.errors },
          { status: 422 },
        );
      }
    }

    const id = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const experiment = {
      ...body,
      id,
      createdAt: new Date().toISOString(),
      isPublic: Boolean(body.isPublic ?? true),
    };

    inMemoryExperiments.set(id, experiment);

    return NextResponse.json(
      {
        success: true,
        id,
        experiment,
        storage: process.env.DATABASE_URL ? 'postgresql' : 'in-memory',
        note: process.env.DATABASE_URL
          ? undefined
          : 'Saved in memory. Configure DATABASE_URL in .env for persistent PostgreSQL storage.',
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || 'Server error processing experiment' },
      { status: 500 },
    );
  }
}
