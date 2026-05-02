# Testing AI Products Take-Home Exercise

## Mid-to-Senior AI Quality Engineer Assessment

### Purpose

This take-home exercise evaluates a candidate's ability to design, execute, and communicate a professional quality strategy for an AI-powered product. The assessment is intended for Mid-to-Senior Quality Engineers working with LLM, RAG, and probabilistic AI systems.

The expected submission should demonstrate both traditional software quality discipline and AI-specific evaluation judgment. Strong responses will clearly distinguish deterministic testing from probabilistic testing, define measurable quality thresholds, and communicate risk in a way that product, engineering, and leadership stakeholders can act on.

### Timebox

The assignment is designed to be completed in 3 to 4 hours. Candidates should prioritize depth of reasoning, defensible assumptions, and high-signal artifacts over exhaustive coverage.

---

## Scenario

You are the Quality Engineer responsible for assessing a new release of **CodeSage**, an AI-integrated IDE assistant that provides real-time code suggestions, refactoring guidance, and automated documentation support.

The upcoming release, **CodeSage v2.1**, introduces a **Context-Aware Code Explainer** feature. The feature uses a Large Language Model with Retrieval-Augmented Generation to explain complex code snippets in natural language. It may draw context from the local codebase, project documentation, dependency metadata, and external technical references.

Your task is to produce a professional test strategy and execution package for this release.

---

## Core Objective

Design and document a testing approach that evaluates whether the Context-Aware Code Explainer is ready for controlled release. Your submission must address functional correctness, non-functional quality, and AI-specific output risks.

The core intent is not to create a large test inventory. The goal is to show how you reason about quality when the system includes both deterministic software components and probabilistic model behavior.

---

## Assessment Phases

### Phase 1: Strategy

Define the system under test, intended users, scope boundaries, assumptions, and release risks.

Your strategy should include:

- In-scope and out-of-scope behavior for CodeSage v2.1.
- Key user workflows and failure modes.
- A risk-based testing approach covering both traditional and AI-specific risks.
- Entry and exit criteria with measurable thresholds.
- A traceability matrix linking requirements, risks, tests, and oracle types.

### Phase 2: Execution

Create and document a representative test set across functional, non-functional, and AI-specific categories.

Your execution artifacts should include:

- Test cases with prompts, setup data, expected behavior, observed behavior, verdict, severity, and notes.
- Clear distinction between exact assertions and statistical or semantic evaluation.
- Evidence of how repeatability, model variability, and evaluator bias are handled.
- A concise defect list with severity and business impact.

### Phase 3: Analysis

Analyze the results and provide a release recommendation.

Your analysis should include:

- Key findings grouped by category.
- A risk matrix with likelihood, impact, detectability, and mitigation.
- A defect severity taxonomy tailored for both functional and AI-quality failures.
- Root cause analysis for the most important defects.
- Recommendations for release gating, remediation, monitoring, and automation.

---

## Required Evaluation Concepts

### Deterministic Testing

Deterministic testing applies when the expected result can be evaluated with stable, exact, or rule-based assertions.

Examples:

- API contract validation.
- Schema and JSON shape checks.
- UI workflow behavior.
- Authentication and authorization behavior.
- Database persistence.
- Export file format correctness.
- Prompt assembly rules where the generated prompt can be inspected directly.

Expected oracle examples:

- Exact match.
- Boolean condition.
- Schema validation.
- Snapshot comparison.
- State transition assertion.
- Latency threshold for a bounded non-model service.

### Probabilistic Testing

Probabilistic testing applies when the system output can vary across runs while still being acceptable. LLM and RAG outputs require evaluation through semantic, statistical, or judgment-based methods rather than exact string matching alone.

Examples:

- Explanation correctness.
- Factual faithfulness to retrieved context.
- Helpfulness and clarity.
- Hallucination resistance.
- Sycophancy resistance.
- Safety refusal behavior.
- Multi-turn semantic consistency.

Expected oracle examples:

- Semantic similarity using embeddings or cosine similarity.
- Faithfulness and answer relevancy scoring through RAGAS, DeepEval, or equivalent tools.
- LLM-as-a-judge scoring with calibrated rubrics and spot-checked human review.
- Perplexity or distributional checks where appropriate for regression detection.
- Repeated-run evaluation with confidence intervals.
- Majority voting or semantic clustering across multiple outputs.

Candidates should explicitly state where deterministic assertions are sufficient and where probabilistic evaluation is required.

---

## Required Test Coverage

### Functional Testing

Cover core product behavior, including:

- Code explanation for simple and complex snippets.
- Context retrieval from relevant project files.
- Handling of ambiguous prompts.
- Multi-turn context retention.
- Error handling for missing or unavailable context.
- Output format compliance when a structure is requested.

### Non-Functional Testing

Define measurable system quality targets. Include realistic thresholds and explain why they matter.

At minimum, address:

- P50, P95, and P99 latency for short, medium, and long context prompts.
- Time to First Token.
- Time Per Output Token.
- Tokens per second.
- Throughput under concurrent usage.
- Error rate and retry behavior.
- Cost per request or cost per 1,000 explanations.
- Context size impact on latency and quality.
- Availability and graceful degradation when retrieval or model services fail.

### AI Output Quality Testing

Evaluate whether the model output is correct, useful, grounded, and stable.

At minimum, address:

- Factual accuracy against source code and retrieved context.
- Faithfulness to retrieved documents.
- Hallucination rate.
- Semantic similarity to expert-written reference answers.
- Explanation clarity and concision.
- Output completeness.
- Contradiction detection.
- Perplexity or distribution shift signals where useful for regression monitoring.
- LLM-as-a-judge methodology, including judge prompt design, scoring scale, calibration, and bias checks.
- Repeated-run variability and confidence intervals.

### Safety, Bias, and Red Teaming

Evaluate the system's resistance to harmful, biased, or non-compliant behavior.

At minimum, address:

- Prompt injection attempts against retrieval context.
- False-premise prompts that encourage sycophancy.
- Requests to explain or improve malicious code.
- Requests to expose secrets, keys, credentials, or private repository data.
- Copyright-sensitive requests and verbatim code reproduction risk.
- Bias in examples, recommendations, or assumptions about users.
- Jailbreak and role-play attempts.
- Multi-turn escalation where a benign conversation becomes unsafe.
- Red team test design, attack categories, severity model, and reproducibility evidence.

---

## Deliverables

Submit a single polished document in Markdown or PDF. The document must be standalone and understandable without additional explanation.

### 1. Strategic Test Plan

Include:

- Objective and scope.
- System assumptions.
- Test levels and test types.
- Risk-based testing approach.
- Entry and exit criteria.
- Traceability matrix.

### 2. Test Case Log

Include a structured table with:

- Test case ID.
- Category.
- Requirement or risk covered.
- Prompt or input.
- Test data or setup.
- Oracle type: deterministic or probabilistic.
- Expected behavior.
- Actual behavior.
- Result: pass, fail, partial, blocked.
- Severity or reliability impact.
- Notes and evidence.

### 3. Risk Matrix

Include:

- Risk ID.
- Risk description.
- Impact.
- Likelihood.
- Detectability.
- Risk score.
- Test coverage.
- Mitigation.
- Release gate recommendation.

### 4. Defect Report and Severity Taxonomy

Include a defect list and define how severity is assigned.

For deterministic defects, severity should consider user impact, data impact, security impact, and reproducibility.

For AI-quality defects, severity should also consider:

- Hallucination risk.
- Safety or compliance exposure.
- User trust impact.
- Confidence degradation.
- Model variability.
- Frequency across repeated runs.
- Detectability by users or downstream systems.

### 5. Root Cause Analysis Framework

For the most important defects, provide a concise RCA using a clear framework such as:

- Symptom.
- Triggering condition.
- Suspected component: retrieval, prompt construction, model inference, guardrail, post-processing, UI, API, or data pipeline.
- Evidence.
- Root cause hypothesis.
- Corrective action.
- Preventive action.
- Owner and validation method.

### 6. Findings Report and Release Recommendation

Include:

- Executive summary.
- Category-level findings.
- Critical defects.
- Residual risks.
- Go, no-go, or conditional-go recommendation.
- Monitoring and rollback recommendations.

### 7. Reflective Analysis

Include:

- How AI testing differs from traditional QA.
- Where deterministic testing was sufficient.
- Where probabilistic testing was required.
- Hardest tradeoff in the exercise.
- What you would automate next and why.

### 8. Optional Automation Proposal

This section is encouraged for senior candidates.

Include:

- Target workflow for automation.
- Tooling recommendation.
- Dataset or golden-set strategy.
- Evaluation metrics.
- Handling of non-deterministic outputs.
- CI/CD integration plan.
- Human review escalation path.

---

## Suggested Document Structure

1. Executive Summary
2. Assumptions and Scope
3. Phase 1: Strategy
4. Phase 2: Execution
5. Phase 3: Analysis
6. Risk Matrix
7. Defect Severity Taxonomy
8. Root Cause Analysis
9. Release Recommendation
10. Reflection
11. Automation Proposal
12. Appendix: Test Case Log

---

## Evaluation Rubric

| Dimension | Weight | Exceeds Expectations | Meets Expectations | Below Expectations |
|---|---:|---|---|---|
| Strategy | 20% | Uses a mature risk-based strategy with clear scope, assumptions, traceability, measurable gates, and AI-specific risk prioritization. | Provides a coherent plan with reasonable scope and basic risk coverage. | Lists generic test types without a defensible strategy or release gates. |
| Functional and API Testing | 15% | Covers workflows, contracts, failure handling, data flow, and integration boundaries with deterministic oracles. | Covers core happy paths and some edge cases. | Focuses mostly on UI or manual checks without meaningful assertions. |
| Non-Functional Testing | 15% | Defines P95/P99 latency, TTFT, TPOT, tokens/sec, throughput, cost, error rate, and degradation thresholds. | Includes latency and basic performance considerations. | Uses vague statements such as "system should be fast" without metrics. |
| AI Output Quality | 20% | Applies semantic similarity, faithfulness, hallucination scoring, repeated runs, confidence intervals, and LLM-as-a-judge with calibration. | Identifies hallucination and factual accuracy with some evaluation method. | Treats model output as simple pass/fail without accounting for variability. |
| Safety, Bias, and Red Teaming | 10% | Includes modern red team categories, prompt injection, sycophancy, privacy, harmful code, copyright, and multi-turn attacks. | Covers basic safety and bias tests. | Omits safety or treats it as generic content moderation. |
| Defect Analysis and RCA | 10% | Provides severity taxonomy, risk matrix, RCA framework, mitigations, release impact, and validation plan. | Provides prioritized defects and basic recommendations. | Reports issues without impact, root cause, or actionable next steps. |
| Communication | 10% | Professional, concise, structured, and ready for leadership review. | Generally clear and organized. | Hard to follow, overly verbose, or missing key artifacts. |

---

## Mindset Differentiator

A traditional QA response usually focuses on scripted checks, exact expected results, and pass/fail validation.

A true AI Quality Engineering response shows how to evaluate a system whose outputs are variable, context-sensitive, and risk-bearing. It combines deterministic controls around the software system with probabilistic evaluation of the model behavior, and it explains how quality signals become release decisions.

Strong candidates will show judgment in the gray areas: how much variation is acceptable, when human review is needed, how to calibrate model-based evaluation, and how to communicate residual risk.

---

## Submission Instructions

Submit one standalone Markdown or PDF document. Include any assumptions, sample prompts, scoring rubrics, and evidence needed to make the assessment reproducible.

Do not spend time building a full automation framework. A concise design and a few representative examples are sufficient within the 3 to 4 hour timebox.

Your final answer should be suitable for review by Quality Engineering, Product, and Engineering leadership.
