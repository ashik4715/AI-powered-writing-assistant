# Bonus: Automation Proposal - Factual Accuracy Testing

## Proposal Summary

**Target Test Category**: AI Quality Testing - Factual Accuracy & Hallucination Detection  
**Objective**: Automate the detection of hallucinations and factual errors in AI outputs  
**Proposed Tooling**: LLM-as-Judge with RAG (Retrieval-Augmented Generation) verification  
**Expected Outcome**: 70% reduction in manual fact-checking effort with 85%+ accuracy

---

## 1. Problem Statement

### Current State (Manual Testing)

From my testing exercise:
- 6 AI Quality test cases required manual fact-checking
- Average time per fact-check: 5-10 minutes (source lookup + verification)
- Hallucinations detected: 2 critical defects (TC-006, TC-011, TC-015)
- Manual verification bottleneck: 60 minutes for factual test suite

**Pain Points**:
1. Time-consuming source lookup (Wikipedia, Britannica, academic sources)
2. Inconsistent verification depth (human fatigue, attention variance)
3. Non-reproducible (different testers may verify differently)
4. Doesn't scale (100 test cases = hours of manual work)

### Target State (Automated)

**Goal**: Automate factual verification with human-in-the-loop for edge cases  
**Target**: 70% automation rate with 85%+ accuracy  
**Time Savings**: 60 minutes → 18 minutes per test suite

---

## 2. Proposed Solution Architecture

### 2.1 High-Level Approach

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Output     │────▶│  Claim Extractor │────▶│  Fact Verify    │
│   (Text)        │     │  (NLP Parser)    │     │  (RAG + APIs)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                              ┌────────────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │  LLM-as-Judge    │
                    │  (Confidence     │
                    │   Scoring)       │
                    └──────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │   PASS     │  │  UNCERTAIN │  │    FAIL    │
    │ (verified) │  │(human req) │  │(hallucin.) │
    └────────────┘  └────────────┘  └────────────┘
```

### 2.2 Component Details

#### Component 1: Claim Extractor

**Purpose**: Parse AI output into verifiable factual claims  
**Implementation**: SpaCy/NLTK NLP pipeline or LLM-based extraction

**Example**:
```
Input: "Einstein gave a speech at Harvard in 1945 about atomic responsibility."
Output: [
  {"claim": "Einstein gave a speech at Harvard", "type": "historical_event"},
  {"claim": "Year was 1945", "type": "date"},
  {"claim": "Topic was atomic responsibility", "type": "topic"}
]
```

**Handling Non-Determinism**: Extract claims with confidence scores; fuzzy match similar claims across runs

---

#### Component 2: Fact Verification Engine

**Purpose**: Verify claims against reliable sources  
**Implementation**: Hybrid approach

**Level 1: Knowledge Base Lookup** (Fast)
- Wikidata API for entities, dates, relationships
- Google Knowledge Graph API
- Custom curated fact database (high-confidence facts)

**Level 2: Web Retrieval** (Medium)
- SerpAPI/Google Search API for recent/current facts
- Wikipedia article retrieval
- Perplexity AI API (already has fact-checking)

**Level 3: Semantic Verification** (Slow)
- RAG with trusted corpora (academic papers, official sources)
- Embedding-based similarity to verified sources
- Cross-reference multiple sources for consensus

**Example Implementation**:
```python
async def verify_claim(claim):
    # Try knowledge base first
    kb_result = await wikidata_lookup(claim)
    if kb_result.confidence > 0.9:
        return kb_result
    
    # Fall back to web search
    search_results = await serpapi_search(claim)
    consensus = calculate_consensus(search_results)
    
    return VerificationResult(
        verified=consensus.agreement > 0.7,
        confidence=consensus.confidence,
        sources=search_results[:3]
    )
```

---

#### Component 3: LLM-as-Judge (Confidence Calibration)

**Purpose**: Evaluate AI's expressed confidence vs. actual accuracy  
**Implementation**: Use GPT-4/Claude as judge

**Prompt Template**:
```
You are evaluating an AI assistant's response for factual accuracy.

CLAIM: {extracted_claim}
AI RESPONSE: {original_response}
VERIFIED FACTS: {verification_results}

Evaluate:
1. Is the AI's claim factually correct? (Yes/No/Partial)
2. Did the AI express appropriate uncertainty? (Yes/No)
3. Confidence score (0-100): How certain is the claim?
4. Severity: Critical/High/Medium/Low if incorrect

RUBRIC:
- Hallucination = Claiming specific facts that are false
- Uncertainty failure = Not expressing doubt on unverifiable claims
- Partial credit = Qualifying statements ("I believe", " reportedly")

Respond in JSON format.
```

**Handling Non-Deterministic Outputs**:
- Run judge LLM 3 times per claim
- Use majority voting for final verdict
- Flag high variance for human review

---

#### Component 4: Human-in-the-Loop Escalation

**Purpose**: Route uncertain cases to human reviewers  
**Triggers**:
- Verification confidence < 0.6
- Judge LLM disagreement across runs
- Claims about sensitive topics (health, legal, financial)
- Novel claims not in any knowledge base

**Implementation**:
- Queue uncertain cases for manual review
- Track human override rates to improve automation
- Feedback loop: human decisions train verification model

---

## 3. Handling Non-Deterministic Outputs

### Challenge
The AI being tested generates different outputs for the same prompt. Manual testing handled this by running 3 times and eyeballing consistency. Automation requires a systematic approach.

### Solutions

#### 3.1 Statistical Sampling
```python
async def test_with_variance(prompt, n=5):
    outputs = await asyncio.gather(*[ai_generate(prompt) for _ in range(n)])
    claims_per_output = [extract_claims(o) for o in outputs]
    
    # Cluster similar claims
    claim_clusters = cluster_by_semantic_similarity(claims_per_output)
    
    # Verify representative claims from each cluster
    results = []
    for cluster in claim_clusters:
        representative = cluster.most_common_claim
        verification = await verify_claim(representative)
        results.append({
            "claim": representative,
            "frequency": cluster.size / n,
            "verification": verification
        })
    
    return results
```

#### 3.2 Consistency Scoring
- **High Consistency**: Same claims in 4/5 runs → verify once
- **Medium Consistency**: Variations of same claim → verify representative
- **Low Consistency**: Completely different claims → flag for investigation

#### 3.3 Semantic Equivalence
Use embeddings to determine if two outputs are saying the same thing differently vs. contradicting each other:
```python
def are_semantically_equivalent(output1, output2):
    emb1 = embedding_model.encode(output1)
    emb2 = embedding_model.encode(output2)
    similarity = cosine_similarity(emb1, emb2)
    return similarity > 0.85  # Threshold for equivalence
```

---

## 4. Tooling & Technologies

### Core Stack

| Component | Technology | Cost Estimate |
|-----------|------------|---------------|
| Claim Extraction | SpaCy + GPT-4 | $0.01-0.05 per test |
| Knowledge Base | Wikidata API | Free |
| Web Search | SerpAPI | $50/month |
| Semantic Search | Pinecone + OpenAI Embeddings | $100/month |
| Judge LLM | GPT-4 API | $0.03-0.06 per test |
| Orchestration | Python + FastAPI | Development cost |
| Storage | PostgreSQL + Redis | $50/month |

**Total Cost**: ~$200-300/month + development time

### Open Source Alternatives
- **Search**: DuckDuckGo scraping (free, rate-limited)
- **Embeddings**: Sentence-Transformers (local, one-time compute)
- **Vector DB**: ChromaDB or Weaviate (open source)
- **LLM Judge**: Local LLaMA or Mistral (eliminates API costs, requires GPU)

---

## 5. Implementation Plan

### Phase 1: MVP (2 weeks)
- Build claim extractor using GPT-4
- Integrate Wikidata API for basic fact-checking
- Create simple pass/fail scoring
- Test on 10 known test cases

**Success Criteria**: 60% automation rate, 80% accuracy

### Phase 2: Enhanced Verification (2 weeks)
- Add web search fallback
- Implement semantic similarity for claim clustering
- Build human-in-the-loop queue
- Expand to 50 test cases

**Success Criteria**: 70% automation rate, 85% accuracy

### Phase 3: Production (2 weeks)
- Optimize for speed (caching, parallelization)
- Add confidence calibration tracking
- Build dashboard for monitoring
- Integrate with CI/CD pipeline

**Success Criteria**: 75% automation rate, 90% accuracy, <5s per test

---

## 6. Expected Outcomes

### Metrics

| Metric | Before (Manual) | After (Automated) | Improvement |
|--------|-----------------|-------------------|-------------|
| Time per factual test | 10 min | 2 min | **5x faster** |
| Test suite execution | 60 min | 18 min | **70% reduction** |
| Coverage (tests/day) | 20 | 100 | **5x coverage** |
| Verification consistency | 70% | 95% | **More reliable** |
| Hallucination detection | 60% | 90% | **Better detection** |

### Qualitative Benefits

1. **Reproducibility**: Same test, same result every time
2. **Scalability**: Can test 1000s of prompts without linear cost increase
3. **Continuous Monitoring**: Run factual tests nightly against new model versions
4. **Regression Detection**: Automatically catch when previously working facts start failing

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Judge LLM makes mistakes | Medium | Human review of uncertain cases; consensus voting |
| API costs too high | Medium | Use open-source LLMs; cache aggressively |
| False positives | High | Calibrate thresholds; human validation of initial results |
| Verification source errors | Medium | Multiple source consensus; source quality scoring |
| Non-determinism causes flakiness | Medium | Statistical approach; retry logic |

---

## 8. Alternative Approaches Considered

### Option A: Rule-Based Fact Checking
- **Approach**: Regex patterns for known facts
- **Rejected**: Too brittle; can't handle novel claims

### Option B: Golden Dataset Comparison
- **Approach**: Compare outputs to pre-approved "correct" answers
- **Rejected**: Doesn't work for open-ended generation; brittle to phrasing changes

### Option C: Human Crowdsourcing
- **Approach**: Amazon Mechanical Turk for fact verification
- **Rejected**: High latency (hours), variable quality, expensive at scale

**Selected Approach** (LLM-as-Judge + RAG) balances automation with accuracy while handling the non-deterministic nature of AI outputs.

---

## 9. Conclusion

This automation proposal targets the most time-consuming and critical aspect of AI testing: factual verification. By combining LLM-as-Judge with retrieval-augmented verification, we can:

1. **Reduce testing time by 70%** while maintaining or improving accuracy
2. **Handle non-deterministic outputs** through statistical clustering
3. **Scale to thousands of test cases** without linear cost increase
4. **Detect hallucinations automatically** with human oversight for edge cases

The investment (~$300/month + 6 weeks development) pays for itself after processing ~500 test cases, making it cost-effective for ongoing AI system validation.

---

**Proposed By**: [Your Name]  
**Date**: May 2026  
**Complexity**: Medium  
**Estimated ROI**: 300% after 6 months
