---
title: "PhD Research Focus: AI in Medicine & Biomedical Engineering"
date: 2025-07-25
tags: [ai, medicine, biomedical-engineering, computer-vision, nlp, privacy, research, uab, phd]
---

# **AI in Medicine & Biomedical Engineering: Research Focus**

## **Research Vision**

My goal is to architect, build, and deploy the next generation of clinical intelligence platforms. As a software engineer with deep experience in both biomedical research and building privacy-first, GPU-accelerated AI systems, I am uniquely positioned to bridge the gap between cutting-edge research and real-world clinical application. My dual background in Computer Science and Philosophy provides the technical expertise and ethical framework required to create AI systems that are not only powerful but also responsible, transparent, and aligned with the core values of patient care.

## **Research Goals**

My research will focus on creating a unified, multi-modal clinical intelligence platform, inspired by my `MediSight` prototype. The primary objectives are:

1.  **Develop `ScribeAI`: An Advanced Clinical Documentation System.** Create and validate a novel system for digitizing clinical documentation, focusing on state-of-the-art handwriting recognition for physician notes, NLP-driven medical entity extraction, and automated ICD-10/CPT coding suggestions.
2.  **Implement `WatchGuard`: A Privacy-First Patient Monitoring System.** Design and build a real-time computer vision system for clinical settings using the NVIDIA stack (DeepStream, TensorRT) for on-premise, edge-based analysis. The system will detect critical events like falls or signs of distress while enforcing strict patient privacy through techniques like federated learning and automatic anonymization.
3.  **Create a Multi-Modal Fusion Engine.** Pioneer methods for integrating the structured data from `ScribeAI` with the real-time observational data from `WatchGuard`. This fusion will power a predictive triage system that provides clinicians with a holistic, context-aware view of patient status.
4.  **Advance Client-Side AI for Clinical Tools.** Extend my work with TensorFlow.js and WebAssembly to build secure, high-performance AI tools (like semantic search and data visualization) that run directly in the browser, ensuring patient data never leaves the local clinical environment.
5.  **Establish a Framework for Ethical AI Deployment.** Formalize the privacy-preserving architectures, consent models, and ethical review processes demonstrated in my projects into a reusable framework for developing and deploying responsible AI in healthcare.

## **Proven Foundation: A Portfolio of Implemented AI Systems**

My research goals are a direct extension of systems I have already designed and prototyped:

-   **`MediSight` Clinical Intelligence Platform:** A comprehensive conceptual framework combining computer vision and NLP to revolutionize healthcare delivery. It features `ScribeAI` for advanced documentation and `WatchGuard` for intelligent waiting room monitoring, all built on a privacy-first, NVIDIA-powered architecture.
-   **NVIDIA Computer Vision Projects:** Extensive hands-on experience with the NVIDIA ecosystem, including optimizing YOLOv8 with **TensorRT** for a 95% reduction in inference time, developing multi-camera 3D reconstruction pipelines with **DeepStream**, and using **Omniverse** for synthetic data generation.
-   **`ScribeAI` & `SageScan`:** Prototypes for clinical documentation automation, focusing on the difficult challenge of physician handwriting recognition and NLP for medical terminology.
-   **Browser-Based AI Engine:** The semantic link generation system in this digital garden, which uses **TensorFlow.js** and the Universal Sentence Encoder to analyze content and discover connections, demonstrating my ability to deploy practical AI features that run entirely on the client side.
-   **Community Leadership (`Build Birmingham`):** Founder and leader of a non-profit initiative to connect and foster tech talent in Alabama, demonstrating my ability to manage complex software projects and build collaborative communities.

## **Technical Foundation & Skills**

My 5+ years of software engineering and research have provided me with a robust and modern technical skillset.

### **AI/ML Specializations**

-   **GPU-Accelerated AI (NVIDIA Stack):**
    -   **Inference Optimization:** TensorRT, INT8 Quantization
    -   **Real-Time Video Analytics:** DeepStream SDK
    -   **Low-Level Programming:** CUDA Kernels
    -   **AI Training & Simulation:** NVIDIA Omniverse, PyTorch, TensorFlow
-   **Computer Vision:**
    -   Real-time object detection (YOLOv8), multi-camera fusion, 3D reconstruction, Neural Radiance Fields (NeRFs).
-   **Natural Language Processing (NLP):**
    -   Medical handwriting recognition (CNNs), medical entity recognition (NER), sentiment analysis, and agentic AI systems.
-   **Privacy-Preserving & Local AI:**
    -   **Client-Side ML:** TensorFlow.js, WebAssembly
    -   **Architecture:** Federated Learning, Differential Privacy, On-Premise/Edge Computing models.

### **Full-Stack Software Engineering**

-   **Backend:** Java (Spring Boot), C# (.NET), Node.js (Express)
-   **Frontend:** JavaScript/TypeScript (React, Preact)
-   **Databases:** PostgreSQL, SQL Server, various ORMs (Hibernate, EF Core)
-   **DevOps & Cloud:** Docker, GitHub Actions, CI/CD, Azure, AWS

## **Research Plan & Methodology**

This research will be conducted in four iterative phases, mirroring the development of a real-world clinical platform.

### **Phase 1: `ScribeAI` - Clinical Data & NLP (Months 1-12)**

Focus on extracting structured, actionable information from the most complex clinical data sources.
-   **Objective:** Develop and validate a novel deep learning pipeline for recognizing physician handwriting from scanned documents with high accuracy.
-   **Methods:** Train a multi-stage CNN-RNN model on public and private medical handwriting datasets. Integrate a medical-terminology-aware language model to improve contextual accuracy.
-   **Outcome:** A validated `ScribeAI` prototype that outperforms existing OCR solutions on clinical notes.

### **Phase 2: `WatchGuard` - Computer Vision at the Edge (Months 6-18)**

Focus on real-time, privacy-preserving analysis of clinical environments.
-   **Objective:** Build and deploy a `WatchGuard` node using a Jetson AGX Orin.
-   **Methods:** Implement a DeepStream pipeline for multi-camera analysis to detect falls, distress indicators, and patient mobility metrics. All processing will be on-device.
-   **Outcome:** A functional edge device capable of generating real-time, anonymous alerts for clinical staff.

### **Phase 3: Multi-Modal Fusion & Predictive Modeling (Months 15-24)**

Focus on combining data streams to generate holistic, predictive insights.
-   **Objective:** Create a fusion model that correlates NLP-derived data from `ScribeAI` with computer vision events from `WatchGuard`.
-   **Methods:** Design a temporal fusion transformer model to predict patient deterioration risk or triage priority.
-   **Outcome:** A predictive model that provides clinicians with a unified risk score, validated against retrospective clinical data.

### **Phase 4: Clinical Integration & Pharmaceutical Applications (Months 24+)**

Focus on real-world application and extension.
-   **Objective:** Integrate the platform with EMR systems using FHIR/HL7 standards and explore pharmaceutical applications.
-   **Methods:** Develop a module for adverse drug event prediction by correlating medication data from `ScribeAI` with subtle symptoms detected by `WatchGuard`.
-   **Outcome:** A comprehensive, documented platform ready for pilot clinical trials.

## **Research Questions & Challenges**

My research will address critical questions at the forefront of medical AI:

### **Technical & Clinical Questions**

-   How can we design multi-modal AI systems that effectively fuse sparse, unstructured text data with dense, real-time video streams for clinical prediction?
-   What are the most effective methods for optimizing complex deep learning models (e.g., for handwriting, behavior analysis) to run efficiently on resource-constrained edge devices like the NVIDIA Jetson?
-   How can synthetic data generation (via Omniverse) be best utilized to bootstrap the training of clinical models while mitigating domain shift issues when applied to real-world data?
-   What is the measurable impact of real-time, AI-driven alerts on clinical response times and patient outcomes in a simulated environment?

### **Ethical & Philosophical Questions**

-   Beyond HIPAA: What technical frameworks (e.g., federated learning, differential privacy) are necessary to build systems that are not just compliant but *philosophically* privacy-preserving?
-   How do we manage the "function creep" of monitoring technologies like `WatchGuard`? Where is the ethical boundary between patient safety and inappropriate surveillance?
-   What constitutes meaningful informed consent for a system that analyzes behavior passively and continuously?
-   How can we build AI systems that enhance, rather than erode, the physician's clinical judgment and the patient's autonomy?

## **Conclusion**

I am not just proposing to study medical AI; I am proposing to build it. My portfolio of implemented systems, deep technical skills in the NVIDIA ecosystem, and foundational experience in biomedical research demonstrate that I have the vision and capability to execute this ambitious research plan. My interdisciplinary background uniquely prepares me to tackle the complex technical, clinical, and ethical challenges inherent in this field. I am confident that through a PhD at UAB, I can develop these concepts into a platform that significantly improves healthcare efficiency and patient outcomes.
