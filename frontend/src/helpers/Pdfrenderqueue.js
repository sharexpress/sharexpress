/*
 * Copyright 2026 Sharexpress Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// pdfRenderQueue.js
// Global singleton queue that limits concurrent PDF renders to MAX_CONCURRENT.
// Prevents unbounded parallel pdfjs instances from consuming all RAM/CPU.
// All PdfThumb components share this one queue.

const MAX_CONCURRENT = 2; // max simultaneous PDF renders at any time

let active = 0;
const queue = []; // pending render tasks: { run, cancel }

const next = () => {
  if (active >= MAX_CONCURRENT || queue.length === 0) return;
  const task = queue.shift();
  active++;
  task.run().finally(() => {
    active--;
    next(); // drain queue
  });
};

// Enqueue a render task.
// Returns a cancel function — call it to remove from queue or abort if running.
export const enqueueRender = (runFn) => {
  let cancelled = false;
  let cancelActive = null; // set by runFn if it starts

  const wrappedRun = () => {
    if (cancelled) return Promise.resolve();
    return runFn((cancelFn) => {
      cancelActive = cancelFn;
    });
  };

  const task = { run: wrappedRun };
  queue.push(task);
  next();

  return () => {
    cancelled = true;
    // Remove from queue if not yet started
    const idx = queue.indexOf(task);
    if (idx !== -1) queue.splice(idx, 1);
    // Abort if already running
    if (cancelActive) cancelActive();
  };
};
