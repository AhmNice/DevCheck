# DevCheck Task Lifecycle & Execution Rules

## 1. Purpose

This document defines the execution-focused task lifecycle for DevCheck. It ensures that the system is not just used for planning tasks, but for completing and shipping work consistently.

---

## 2. Core Principle

> One active task is more valuable than multiple planned tasks.

DevCheck enforces structured execution by limiting multitasking and guiding users through a clear task lifecycle.

---

## 3. Task Lifecycle States

### 3.1 Backlog

* Task exists but is not scheduled
* No due date required
* No commitment yet

Meaning:

* "I might do this later"

---

### 3.2 Planned

* Task has a due date and priority
* Ready to be worked on
* Not yet started

Meaning:

* "I intend to do this"

---

### 3.3 In Progress

* Task is actively being worked on
* Represents current focus

Constraints:

* Only 1 active task allowed at a time (configurable to max 2)

Meaning:

* "I am working on this now"

---

### 3.4 In Review

* Task work is completed but not finalized
* Awaiting validation (testing, review, approval)

Meaning:

* "Work is done but not yet shipped"

---

### 3.5 Shipped

* Task is fully completed and delivered
* Represents true completion

Examples:

* Code deployed
* Feature released
* Design approved

Meaning:

* "This task is done and delivered"

---

### 3.6 Blocked

* Task cannot proceed due to dependency or issue

Requirements:

* Must include a blocked reason

Examples:

* Waiting for API
* Waiting for client feedback

Meaning:

* "I cannot proceed with this task right now"

---

## 4. Lifecycle Flow

Standard Flow:
Backlog → Planned → In Progress → In Review → Shipped

Alternative Flow:
In Progress → Blocked → In Progress

Notes:

* Tasks can move back from In Review to In Progress if changes are required
* Blocked tasks must return to In Progress once resolved

---

## 5. Execution Rules

### Rule 1: Active Task Limit

* A user can only have 1 active task in "In Progress"
* Optional configuration allows a maximum of 2

Purpose:

* Prevent multitasking and improve focus

---

### Rule 2: Subtask-Driven Progress

* Task progress is calculated based on completed subtasks
* If no subtasks exist, manual progress update is allowed

---

### Rule 3: Review Before Ship (Optional)

* Tasks may require passing through "In Review" before being marked as "Shipped"

---

### Rule 4: Overdue Enforcement

* Tasks in Planned or In Progress past due date are marked as overdue
* Overdue tasks must be clearly visible in UI

---

### Rule 5: Blocked Reason Required

* Tasks moved to Blocked must include a reason

---

### Rule 6: Idle Task Detection (Future Enhancement)

* Tasks not updated within a defined period trigger reminders

---

## 6. Status Transition Rules

Allowed Transitions:

* Backlog → Planned
* Planned → In Progress
* In Progress → In Review
* In Review → Shipped
* In Review → In Progress
* In Progress → Blocked
* Blocked → In Progress

Disallowed Transitions (Examples):

* Backlog → Shipped
* Planned → Shipped (without work)

---

## 7. Data Model Considerations

Each task should include:

* status (enum)
* priority (low, medium, high)
* due date
* startedAt (timestamp)
* shippedAt (timestamp)
* blockedReason (optional)
* progress (derived from subtasks)

---

## 8. System Behavior Expectations

* The system should guide users toward completing tasks, not just creating them
* UI should emphasize active and overdue tasks over backlog items
* Notifications should be contextual and execution-focused

---

## 9. Future Enhancements

* Smart task prioritization
* AI-assisted task breakdown
* Automatic status updates via integrations (e.g., GitHub)

---

## 10. Summary

DevCheck enforces a structured execution workflow where tasks move through clear states and are completed with discipline.

The goal is not just task tracking, but ensuring tasks are finished and delivered.
