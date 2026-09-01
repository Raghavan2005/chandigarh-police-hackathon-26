"use client";

import { useEffect, useRef, useState } from "react";
import { pipelineSteps } from "@/lib/mock-data";
import type { PipelineStepState } from "@/lib/types";

export interface PipelineRunState {
  states: PipelineStepState[];
  activeIndex: number; // -1 before start, steps.length when complete
  complete: boolean;
  running: boolean;
  restart: () => void;
}

/**
 * Drives the scripted "Investigate" pipeline animation. Autoplays once on
 * mount (or on demand via `restart`) using each step's fixed durationMs —
 * deterministic so recorded takes are repeatable.
 */
export function usePipeline(autoplay = true): PipelineRunState {
  const [states, setStates] = useState<PipelineStepState[]>(
    pipelineSteps.map(() => "pending"),
  );
  const [activeIndex, setActiveIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const run = () => {
    clearTimers();
    setStates(pipelineSteps.map(() => "pending"));
    setActiveIndex(-1);
    setRunning(true);

    let elapsed = 0;
    pipelineSteps.forEach((step, i) => {
      const startTimer = window.setTimeout(() => {
        setActiveIndex(i);
        setStates((prev) => prev.map((s, j) => (j === i ? "running" : s)));
      }, elapsed);
      timers.current.push(startTimer);

      elapsed += step.durationMs;

      const doneTimer = window.setTimeout(() => {
        setStates((prev) => prev.map((s, j) => (j === i ? "done" : s)));
        if (i === pipelineSteps.length - 1) {
          setRunning(false);
          setActiveIndex(pipelineSteps.length);
        }
      }, elapsed);
      timers.current.push(doneTimer);
    });
  };

  useEffect(() => {
    if (!autoplay) return;
    const kickoff = window.setTimeout(run, 0);
    return () => {
      window.clearTimeout(kickoff);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    states,
    activeIndex,
    complete: activeIndex === pipelineSteps.length,
    running,
    restart: run,
  };
}
