import { YouTubeStudyNotes, SeoGuideArticle, AffiliateDeal } from '../types';

export interface VideoPreset {
  id: string;
  title: string;
  creator: string;
  subject: string;
  url: string;
  videoId: string;
  duration: string;
  thumbnail: string;
  description: string;
  tags: string[];
  mockData: YouTubeStudyNotes;
}

export const SAMPLE_VIDEO_PRESETS: VideoPreset[] = [
  {
    id: 'linear-algebra-mit',
    title: 'MIT 18.06 Linear Algebra: Eigenvalues and Eigenvectors',
    creator: 'Prof. Gilbert Strang (MIT OpenCourseWare)',
    subject: 'Mathematics',
    url: 'https://www.youtube.com/watch?v=cdZnhQjJu4I',
    videoId: 'cdZnhQjJu4I',
    duration: '51:24',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    description: 'The fundamental equation Ax = lambda x, characteristic polynomials, algebraic vs geometric multiplicity, and matrix diagonalization.',
    tags: ['Linear Algebra', 'Calculus', 'Eigenvalues', 'MIT'],
    mockData: {
      id: 'mock-linear-algebra',
      title: 'Eigenvalues and Eigenvectors - MIT 18.06',
      videoUrl: 'https://www.youtube.com/watch?v=cdZnhQjJu4I',
      videoId: 'cdZnhQjJu4I',
      subject: 'Mathematics',
      difficulty: 'Intermediate / University',
      estimatedReadTime: '8 min study read',
      executiveSummary: 'Prof. Gilbert Strang demystifies one of the most vital concepts in modern applied mathematics: eigenvalues and eigenvectors. Rather than rotating or distorting arbitrarily in high-dimensional space, eigenvectors maintain their exact direction when acted upon by matrix A, only scaling by a scalar factor λ (the eigenvalue). This property underpins quantum mechanics, search engine ranking algorithms (PageRank), vibrational mode physics, and principal component analysis (PCA).',
      keyTakeaways: [
        'The fundamental eigenvalue equation is: A x = λ x, where x != 0.',
        'To find eigenvalues λ, solve the characteristic equation: det(A - λ I) = 0.',
        'The trace of matrix A equals the sum of its eigenvalues (Tr(A) = Σ λ_i).',
        'The determinant of matrix A equals the product of its eigenvalues (det(A) = Π λ_i).',
        'If an n x n matrix has n independent eigenvectors, it can be diagonalized as A = S Λ S⁻¹.'
      ],
      timestampedSections: [
        {
          timestamp: '00:00',
          topic: 'Geometric Intuition of Matrix Transformations',
          summary: 'Most vectors change direction when multiplied by matrix A. Eigenvectors are the special "axes of inertia" that remain on the same line.',
          keyTerms: ['Eigenvector', 'Transformation', 'Invariance']
        },
        {
          timestamp: '08:45',
          topic: 'The Characteristic Equation: det(A - λI) = 0',
          summary: 'Why (A - λI) must be a singular matrix. Setting the determinant of (A - λI) to 0 yields an n-th degree polynomial in λ.',
          keyTerms: ['Singular Matrix', 'Nullspace', 'Characteristic Polynomial']
        },
        {
          timestamp: '22:10',
          topic: 'Trace and Determinant Shortcuts',
          summary: 'Verifying calculated eigenvalues using Tr(A) = sum(λ) and det(A) = prod(λ). Essential for double checking university exam problems in 30 seconds.',
          keyTerms: ['Trace', 'Determinant', 'Verification']
        },
        {
          timestamp: '36:40',
          topic: 'Matrix Diagonalization (A = S Λ S⁻¹)',
          summary: 'Forming the eigenvector matrix S and eigenvalue diagonal matrix Λ. Computing powers like A¹⁰⁰ by simply calculating S Λ¹⁰⁰ S⁻¹.',
          keyTerms: ['Diagonalization', 'Matrix Powers', 'Eigenbasis']
        }
      ],
      cornellNotes: {
        cuesAndQuestions: [
          'What condition must matrix (A - λI) satisfy for a non-zero eigenvector to exist?',
          'How do you compute A¹⁰⁰ efficiently using diagonalization?',
          'What happens when eigenvalues are repeated (algebraic vs geometric multiplicity)?'
        ],
        detailedNotes: `## Core Mathematical Formulation
- **Fundamental Definition**:
  $$A x = \\lambda x \\iff (A - \\lambda I) x = 0$$
- For a non-trivial solution $x \\neq 0$, the matrix $(A - \\lambda I)$ must have a non-trivial nullspace, meaning:
  $$\\det(A - \\lambda I) = 0$$

## Step-by-Step Problem Solving Workflow
1. Form matrix $(A - \\lambda I)$ by subtracting $\\lambda$ along the main diagonal.
2. Compute $\\det(A - \\lambda I) = 0$ to get the characteristic polynomial.
3. Factor the polynomial to find all roots $\\lambda_1, \\lambda_2, \\dots, \\lambda_n$.
4. For each $\\lambda_i$, solve $(A - \\lambda_i I) x = 0$ via Gaussian elimination to find the corresponding eigenspace basis vectors.
5. Check: Sum of $\\lambda_i = \\text{Trace}(A)$, Product of $\\lambda_i = \\det(A)$.

## Key Applications
- **Differential Equations**: $\\frac{du}{dt} = Au \\implies u(t) = c_1 e^{\\lambda_1 t} x_1 + c_2 e^{\\lambda_2 t} x_2$
- **Markov Chains**: Steady state distribution corresponds to $\\lambda = 1$.
- **Computer Science**: Google PageRank vector is the dominant eigenvector of the hyperlink transition matrix.`,
        bottomSummary: 'Eigenvectors are non-zero vectors that only scale by λ when multiplied by matrix A. Solving det(A - λI) = 0 yields eigenvalues, and diagonalizing A = SΛS⁻¹ allows effortless computation of large matrix powers and dynamic systems.'
      },
      keyDefinitions: [
        {
          term: 'Eigenvalue (λ)',
          definition: 'A scalar by which an eigenvector is stretched or shrunk during linear transformation.',
          exampleOrMnemonic: 'German "Eigen" means "own" or "characteristic". The matrix\'s own personal scaling factors.'
        },
        {
          term: 'Characteristic Polynomial',
          definition: 'The polynomial p(λ) = det(A - λI) whose roots are the eigenvalues of matrix A.',
          exampleOrMnemonic: 'For a 2x2 matrix: λ² - Tr(A)λ + det(A) = 0.'
        },
        {
          term: 'Matrix Diagonalization',
          definition: 'Expressing A as SΛS⁻¹ where S contains columns of eigenvectors and Λ is a diagonal matrix of eigenvalues.',
          exampleOrMnemonic: 'Turns messy coupled equations into separate, independent 1D problems.'
        }
      ],
      flashcards: [
        {
          id: 'fc1',
          front: 'What is the characteristic equation used to solve for eigenvalues λ?',
          back: 'det(A - λI) = 0',
          category: 'Formula'
        },
        {
          id: 'fc2',
          front: 'What is the relationship between the trace of matrix A and its eigenvalues?',
          back: 'Trace(A) = sum of all eigenvalues (λ₁ + λ₂ + ... + λₙ)',
          category: 'Theorem'
        },
        {
          id: 'fc3',
          front: 'If A = S Λ S⁻¹, how do you compute Aᵏ for a large power k?',
          back: 'Aᵏ = S (Λᵏ) S⁻¹, where Λᵏ simply raises the diagonal elements to the power of k.',
          category: 'Application'
        },
        {
          id: 'fc4',
          front: 'Can an eigenvector x be the zero vector 0?',
          back: 'NO. By definition, eigenvectors MUST be non-zero (x ≠ 0), though an eigenvalue λ CAN be zero.',
          category: 'Definition'
        }
      ],
      quiz: [
        {
          id: 'q1',
          question: 'If a 2x2 matrix has trace = 7 and determinant = 10, what are its eigenvalues?',
          options: ['λ = 2 and λ = 5', 'λ = 1 and λ = 10', 'λ = 3 and λ = 4', 'λ = -2 and λ = -5'],
          correctIndex: 0,
          explanation: 'The characteristic equation is λ² - Tr(A)λ + det(A) = 0 → λ² - 7λ + 10 = 0 → (λ - 2)(λ - 5) = 0. Therefore λ = 2 and λ = 5.'
        },
        {
          id: 'q2',
          question: 'What does it mean if an eigenvalue λ = 0 for matrix A?',
          options: ['The matrix A is singular and not invertible (det(A) = 0)', 'The eigenvectors cannot be calculated', 'All diagonal elements must be 0', 'The matrix is symmetric'],
          correctIndex: 0,
          explanation: 'Since det(A) = product of eigenvalues, if one eigenvalue is 0, then det(A) = 0, which means matrix A is singular and non-invertible.'
        },
        {
          id: 'q3',
          question: 'Under what condition is an n x n matrix guaranteed to be diagonalizable?',
          options: ['When it has n distinct, linearly independent eigenvectors', 'Only when all eigenvalues are positive', 'When its determinant is non-zero', 'When the matrix is upper triangular only'],
          correctIndex: 0,
          explanation: 'A matrix can be diagonalized into A = SΛS⁻¹ if and only if it has n linearly independent eigenvectors to form the columns of invertible matrix S.'
        }
      ],
      mindmap: [
        {
          mainBranch: 'Eigenvalue Theory',
          subNodes: ['Definition Ax = λx', 'Characteristic equation det(A - λI) = 0', 'Algebraic vs Geometric multiplicity']
        },
        {
          mainBranch: 'Computational Shortcuts',
          subNodes: ['Trace(A) = sum(λ)', 'Det(A) = prod(λ)', 'Triangular matrix diagonal shortcut']
        },
        {
          mainBranch: 'Practical Applications',
          subNodes: ['Matrix powers A^k = S Λ^k S^-1', 'Markov steady state (λ=1)', 'Differential equations u(t) = e^(At) u(0)']
        }
      ],
      actionChecklist: [
        'Practice finding eigenvalues for a 2x2 symmetric matrix',
        'Verify eigenvalues using trace and determinant properties',
        'Construct eigenvector matrix S and verify S * Λ * S^(-1) = A',
        'Solve 1 differential equation initial value problem using eigenbasis'
      ],
      createdAt: '2026-08-20T10:00:00.000Z'
    }
  },
  {
    id: 'crashcourse-bio-respiration',
    title: 'CrashCourse Biology: ATP & Cellular Respiration',
    creator: 'Hank Green (CrashCourse)',
    subject: 'Biology / Biochemistry',
    url: 'https://www.youtube.com/watch?v=00jbG_cfGuQ',
    videoId: '00jbG_cfGuQ',
    duration: '13:26',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    description: 'Glycolysis, the Krebs citric acid cycle, electron transport chain, and oxidative phosphorylation yielding ATP.',
    tags: ['Biology', 'ATP', 'Cellular Respiration', 'Biochemistry'],
    mockData: {
      id: 'mock-cellular-respiration',
      title: 'ATP & Cellular Respiration - CrashCourse Biology',
      videoUrl: 'https://www.youtube.com/watch?v=00jbG_cfGuQ',
      videoId: '00jbG_cfGuQ',
      subject: 'Biochemistry / Cellular Biology',
      difficulty: 'High School AP / College Intro',
      estimatedReadTime: '6 min study read',
      executiveSummary: 'Cellular respiration is the biochemical engine of life on Earth. Hank Green walks through the 3 major stages that break down glucose (C₆H₁₂O₆) in the presence of oxygen to generate cellular energy in the form of ATP: 1) Glycolysis in the cytoplasm, 2) The Krebs (Citric Acid) Cycle in the mitochondrial matrix, and 3) The Electron Transport Chain / Oxidative Phosphorylation on the inner mitochondrial cristae.',
      keyTakeaways: [
        'Overall formula: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~36-38 ATP.',
        'Glycolysis occurs in the cytoplasm and is anaerobic (does not require O₂), yielding net 2 ATP, 2 NADH, and 2 Pyruvate.',
        'The Krebs cycle processes acetyl-CoA in the mitochondrial matrix, releasing CO₂ and charging high-energy electron carriers (NADH, FADH₂).',
        'The Electron Transport Chain uses oxygen as the final electron acceptor, driving ATP synthase via a proton gradient (chemiosmosis).'
      ],
      timestampedSections: [
        {
          timestamp: '00:00',
          topic: 'ATP: The Universal Energy Currency',
          summary: 'Adenosine triphosphate stores energy in high-energy phosphate bonds. Removing one phosphate creates ADP and releases free energy.',
          keyTerms: ['ATP', 'ADP', 'Phosphorylation']
        },
        {
          timestamp: '03:15',
          topic: 'Stage 1: Glycolysis (Cytoplasm)',
          summary: '10-step enzymatic pathway splitting 6-carbon glucose into two 3-carbon pyruvates. Costs 2 ATP, generates 4 ATP (net +2 ATP) and 2 NADH.',
          keyTerms: ['Glycolysis', 'Pyruvate', 'NADH', 'Substrate-level phosphorylation']
        },
        {
          timestamp: '06:50',
          topic: 'Stage 2: The Krebs (Citric Acid) Cycle',
          summary: 'Pyruvate enters mitochondria, is converted to Acetyl-CoA, and enters the cyclical matrix reaction generating CO₂, NADH, FADH₂, and ATP.',
          keyTerms: ['Krebs Cycle', 'Mitochondrial Matrix', 'Acetyl-CoA', 'FADH2']
        },
        {
          timestamp: '10:05',
          topic: 'Stage 3: Electron Transport Chain & ATP Synthase',
          summary: 'Electrons pass through Complexes I-IV pumping H+ into intermembrane space. Oxygen grabs spent electrons to form H₂O while ATP synthase spins to produce ~32-34 ATP.',
          keyTerms: ['Chemiosmosis', 'ATP Synthase', 'Proton Motive Force', 'Oxidative Phosphorylation']
        }
      ],
      cornellNotes: {
        cuesAndQuestions: [
          'What is the final electron acceptor in aerobic cellular respiration?',
          'Why does lack of oxygen halt the Krebs cycle even though Krebs doesn\'t directly use oxygen?',
          'How does the electrochemical proton gradient drive ATP synthesis?'
        ],
        detailedNotes: `## Overview Equation
$$\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\longrightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + 36-38\\text{ ATP}$$

## 3 Main Stages Breakdown
| Stage | Cellular Location | Oxygen Required? | Key Outputs |
| :--- | :--- | :--- | :--- |
| **Glycolysis** | Cytoplasm (Cytosol) | No (Anaerobic) | 2 Pyruvate, 2 Net ATP, 2 NADH |
| **Krebs Cycle** | Mitochondrial Matrix | Yes (Indirectly) | 6 NADH, 2 FADH₂, 2 ATP, 4 CO₂ |
| **ETC & Chemiosmosis**| Inner Mitochondrial Cristae | Yes (Directly) | ~32-34 ATP, 6 H₂O |

## The Role of Oxygen
Oxygen ($O_2$) has high electronegativity. It acts as the final electron sink at Complex IV, combining with electrons and protons to form harmless $H_2O$. Without oxygen, electrons back up, NADH cannot be oxidized back to $NAD^+$, and the entire mitochondrial respiration shuts down.`,
        bottomSummary: 'Cellular respiration converts glucose into ATP across 3 phases: Glycolysis (cytosol, net 2 ATP), Krebs Cycle (matrix, electron carrier loading), and Oxidative Phosphorylation (cristae, ~34 ATP driven by proton gradient and oxygen).'
      },
      keyDefinitions: [
        {
          term: 'Chemiosmosis',
          definition: 'The movement of protons (H+) across a selectively permeable membrane down their electrochemical gradient to generate ATP.',
          exampleOrMnemonic: 'Like water powering a hydroelectric dam turbine, protons rush through ATP Synthase.'
        },
        {
          term: 'Substrate-Level vs Oxidative Phosphorylation',
          definition: 'Substrate-level creates ATP directly via enzymatic transfer of a phosphate group (Glycolysis & Krebs). Oxidative uses redox electron transfer and ATP synthase.',
          exampleOrMnemonic: 'Substrate = direct cash hand-off. Oxidative = power plant generator.'
        }
      ],
      flashcards: [
        {
          id: 'bio-fc1',
          front: 'What is the net ATP yield from 1 molecule of glucose during Glycolysis alone?',
          back: 'Net 2 ATP (4 ATP produced minus 2 ATP consumed during investment phase).',
          category: 'Glycolysis'
        },
        {
          id: 'bio-fc2',
          front: 'Where specifically does the Krebs (Citric Acid) Cycle occur in eukaryotic cells?',
          back: 'Inside the Mitochondrial Matrix.',
          category: 'Location'
        },
        {
          id: 'bio-fc3',
          front: 'What molecule acts as the final electron acceptor in the electron transport chain?',
          back: 'Molecular Oxygen (O₂), which accepts electrons and H+ to form Water (H₂O).',
          category: 'ETC'
        }
      ],
      quiz: [
        {
          id: 'bio-q1',
          question: 'If a cell is deprived of oxygen (anaerobic conditions), which process can still proceed?',
          options: ['Glycolysis followed by fermentation', 'The Krebs Cycle', 'Electron Transport Chain', 'Oxidative phosphorylation'],
          correctIndex: 0,
          explanation: 'Glycolysis does not require oxygen. In the absence of oxygen, cells undergo lactic acid or alcoholic fermentation to regenerate NAD+ so glycolysis can continue producing 2 ATP.'
        },
        {
          id: 'bio-q2',
          question: 'Protons (H+) are pumped across the inner mitochondrial membrane into which compartment during the ETC?',
          options: ['The intermembrane space', 'The mitochondrial matrix', 'The outer cytoplasm', 'The nucleus'],
          correctIndex: 0,
          explanation: 'Complexes I, III, and IV pump protons from the matrix into the intermembrane space, creating a steep electrochemical concentration gradient.'
        }
      ],
      mindmap: [
        {
          mainBranch: 'Cellular Respiration',
          subNodes: ['Phase 1: Glycolysis', 'Phase 2: Krebs Cycle', 'Phase 3: ETC / Chemiosmosis']
        },
        {
          mainBranch: 'Energy Yields',
          subNodes: ['Net 2 ATP in Cytosol', '2 ATP in Matrix', '~34 ATP on Cristae']
        }
      ],
      actionChecklist: [
        'Draw the mitochondria and label matrix, cristae, and intermembrane space',
        'Trace the path of 1 glucose molecule to all 6 CO2 byproducts',
        'Memorize net ATP, NADH, and FADH2 counts for each stage'
      ],
      createdAt: '2026-08-21T14:30:00.000Z'
    }
  },
  {
    id: 'huberman-focus-learning',
    title: 'Huberman Lab: Master Your Focus & Accelerate Learning Speed',
    creator: 'Dr. Andrew Huberman (Stanford School of Medicine)',
    subject: 'Neuroscience & Study Productivity',
    url: 'https://www.youtube.com/watch?v=lgZ0xKkH6w8',
    videoId: 'lgZ0xKkH6w8',
    duration: '2:14:18',
    thumbnail: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    description: 'Neuroplasticity, 90-minute ultradian study bouts, non-sleep deep rest (NSDR), dopamine management, and optimal learning protocols.',
    tags: ['Neuroscience', 'Study Skills', 'Focus', 'Stanford'],
    mockData: {
      id: 'mock-huberman-focus',
      title: 'Neurobiology of Deep Focus & Rapid Learning - Huberman Lab',
      videoUrl: 'https://www.youtube.com/watch?v=lgZ0xKkH6w8',
      videoId: 'lgZ0xKkH6w8',
      subject: 'Neurobiology & Cognitive Science',
      difficulty: 'All Students',
      estimatedReadTime: '7 min study read',
      executiveSummary: 'Dr. Andrew Huberman explains the neurochemical and biological systems governing attention, deep focus, and synaptic plasticity. Neuroplasticity (the brain\'s physical rewiring during learning) is triggered by the neurochemicals Epinephrine (alertness) and Acetylcholine (focus spotlight), but actual synaptic consolidation occurs during deep sleep and Non-Sleep Deep Rest (NSDR). Structuring study sessions in 90-minute ultradian cycles optimizes peak cognitive throughput without neural fatigue.',
      keyTakeaways: [
        'Epinephrine creates alertness; Acetylcholine acts as the focal spotlight directing plasticity.',
        'Study in 90-minute Ultradian Focus Bouts: 5-10 min warm up, 60-70 min peak work, 10 min cool down.',
        'Visual focus drives cognitive focus: Staring at a single point for 30-60 seconds recruits prefrontal neural circuits.',
        'Gaps and micro-rests: Pausing for 10-20 seconds during flashcard/coding drills causes the hippocampus to replay neural patterns at 20x speed.',
        'NSDR (Non-Sleep Deep Rest / Yoga Nidra) for 10-20 minutes post-study accelerates memory consolidation by 50%.'
      ],
      timestampedSections: [
        {
          timestamp: '00:00',
          topic: 'The Triad of Neurochemicals: Epinephrine, Acetylcholine, Dopamine',
          summary: 'Alertness + Attention + Reward. How dopamine reinforces error correction during difficult study problems.',
          keyTerms: ['Neuroplasticity', 'Acetylcholine', 'Dopamine baseline']
        },
        {
          timestamp: '25:30',
          topic: 'The 90-Minute Ultradian Study Protocol',
          summary: 'Why 45-90 minute blocks match natural brain cycles. How to transition into high focus without forcing immediate flow.',
          keyTerms: ['Ultradian Rhythm', 'Focus Bout', 'Cognitive Warmup']
        },
        {
          timestamp: '58:10',
          topic: 'Visual Field & Attention Connection',
          summary: 'How foveal vision triggers autonomic alertness, while panoramic vision triggers parasympathetic calm.',
          keyTerms: ['Foveal Vision', 'Panoramic Vision', 'Optic Flow']
        },
        {
          timestamp: '1:32:40',
          topic: 'Memory Consolidation via NSDR & Sleep',
          summary: 'Rewiring happens in slow-wave sleep and 10-minute rest intervals, not while studying.',
          keyTerms: ['Synaptic Consolidation', 'NSDR', 'Hippocampal Replay']
        }
      ],
      cornellNotes: {
        cuesAndQuestions: [
          'What two chemicals must be present in the brain to trigger neuroplasticity?',
          'Why are micro-rest pauses during active recall so effective for memory storage?',
          'How should a student structure their daily 90-minute study bouts?'
        ],
        detailedNotes: `## Neurochemical Formula for Learning
$$\\text{Plasticity} = \\text{Epinephrine (Alertness)} + \\text{Acetylcholine (Focus)} + \\text{Sleep / Rest (Consolidation)}$$

## Actionable Study Session Protocol
1. **Pre-Study (2 mins)**: Set phone in another room. Stare at a focal point on your desk/screen for 30 seconds to focus visual apparatus.
2. **Warmup Phase (Minutes 0–10)**: Expect friction and mind-wandering. This is normal autonomic arousal.
3. **Core Sprint (Minutes 10–75)**: High-yield active recall, hard problem solving, or synthesis.
4. **Micro-Gaps**: Every 15-20 cards or problems, stop for 10 seconds and do nothing. (Spikes hippocampal replay rate 20x).
5. **Post-Session (Minutes 75–90)**: 10-minute NSDR or relaxed walk without looking at social media.`,
        bottomSummary: 'Learning is triggered by intense alert focus (acetylcholine + epinephrine) and locked into long-term memory during subsequent rest and sleep. Limit hard cognitive work to 90-minute blocks with micro-pauses.'
      },
      keyDefinitions: [
        {
          term: 'Ultradian Rhythm',
          definition: 'A biological cycle that recurs throughout a 24-hour day with a frequency of approximately 90 minutes.',
          exampleOrMnemonic: 'The brain\'s natural 90-minute battery cycle for peak concentration.'
        },
        {
          term: 'Non-Sleep Deep Rest (NSDR)',
          definition: 'A state of conscious physiological relaxation (like Yoga Nidra or guided breathwork) that rapidly restores dopamine and accelerates memory retention.',
          exampleOrMnemonic: 'A 10-minute mental reboot that speeds up learning.'
        }
      ],
      flashcards: [
        {
          id: 'hub-1',
          front: 'What is the optimal duration for a deep cognitive focus study session based on brain biology?',
          back: '90 minutes (matching natural ultradian rhythm cycles).',
          category: 'Productivity'
        },
        {
          id: 'hub-2',
          front: 'When does the actual physical rewiring (consolidation) of new memories happen?',
          back: 'During deep sleep (slow-wave sleep) and Non-Sleep Deep Rest (NSDR) periods, NOT during active studying.',
          category: 'Memory'
        }
      ],
      quiz: [
        {
          id: 'hub-q1',
          question: 'What simple visual technique can a student use to quickly sharpen mental focus before studying?',
          options: ['Focusing their gaze on a single point for 30–60 seconds', 'Looking around the room rapidly', 'Closing both eyes for 10 minutes', 'Reading in dim lighting'],
          correctIndex: 0,
          explanation: 'Foveal visual focus activates the sympathetic neural circuitry and acetylcholine release, directly narrowing the cognitive spotlight for study.'
        }
      ],
      mindmap: [
        {
          mainBranch: 'Biology of Focus',
          subNodes: ['Epinephrine (Alertness)', 'Acetylcholine (Focus Spotlight)', 'Dopamine (Motivation Engine)']
        },
        {
          mainBranch: 'Study Protocols',
          subNodes: ['90-min Ultradian blocks', 'Visual focal gaze trigger', 'Micro-pause hippocampal replay', 'Post-study NSDR']
        }
      ],
      actionChecklist: [
        'Schedule two 90-minute deep study blocks for tomorrow',
        'Perform a 30-second focal gaze warmup before starting',
        'Add 10-second idle pauses after completing hard flashcard sets',
        'Take a 10-minute non-screen rest or NSDR right after finishing'
      ],
      createdAt: '2026-08-22T08:00:00.000Z'
    }
  }
];

export const SEO_STUDY_GUIDES: SeoGuideArticle[] = [
  {
    slug: 'youtube-to-study-notes-guide',
    title: 'How to Turn Any YouTube Video into Perfect Study Notes (Cornell Method & AI)',
    category: 'Study Methodologies',
    readTime: '5 min read',
    metaDesc: 'Discover how college and high school students turn 1-hour YouTube lectures into 5-minute Cornell study notes, active recall flashcards, and practice exam quizzes.',
    keyTopics: ['Cornell Notes Method', 'YouTube Study Hacks', 'AI Lecture Summarization', 'Active Recall'],
    summary: 'Watching 2-hour lectures passively results in less than 20% information retention after 48 hours. Learn the exact framework for converting video lectures into high-yield exam notes.',
    contentMarkdown: `## The Problem with Passive Video Watching
Students spend hundreds of hours watching YouTube lectures from MIT OpenCourseWare, CrashCourse, Khan Academy, and Professor Leonard. However, psychological research on the **Ebbinghaus Forgetting Curve** proves that passive video watching leads to losing up to **80% of information within 48 hours**.

### The 3-Step Active Recall Framework for Video Lectures
1. **Timestamped Topic Chunking**: Break 60-minute videos into 5–10 minute distinct conceptual units.
2. **Cornell Cue Generation**: Instead of transcribing what the lecturer says, write **questions you must answer from memory**.
3. **Immediate Active Recall Test**: Within 10 minutes of finishing the video, answer 3–5 flashcard questions without looking at the notes.

### Using StudyGem to Automate the Heavy Lifting
StudyGem analyzes lecture speech and synthesizes:
- **Executive 3-paragraph summary**
- **Clickable timestamp chapters**
- **Auto-generated active recall flashcards**
- **Exam-level practice quizzes**`,
    relatedGem: 'youtube',
    samplePrompt: 'Paste any MIT OCW or Khan Academy URL into StudyGem to see this in action!'
  },
  {
    slug: 'calculus-derivatives-cheat-sheet',
    title: 'Master Calculus 1: Derivatives, Integrals & Limit Laws Ultimate Cheat Sheet',
    category: 'Mathematics & STEM',
    readTime: '7 min read',
    metaDesc: 'Complete college Calculus 1 cheat sheet covering product rule, quotient rule, chain rule, trigonometric derivatives, L\'Hopital\'s rule, and Riemann sums.',
    keyTopics: ['Calculus 1', 'Derivatives', 'Chain Rule', 'L\'Hopital Rule', 'Integration'],
    summary: 'The ultimate condensed revision sheet for university Calculus 1, AP Calculus AB/BC, and Engineering mathematics.',
    contentMarkdown: `## Fundamental Limit Definitions
$$\\lim_{x \\to a} f(x) = L \\iff \\forall \\varepsilon > 0, \\exists \\delta > 0 \\text{ s.t. } 0 < |x - a| < \\delta \\implies |f(x) - L| < \\varepsilon$$

## Essential Differentiation Rules
- **Power Rule**: $\\frac{d}{dx}[x^n] = n x^{n-1}$
- **Product Rule**: $\\frac{d}{dx}[f(x) g(x)] = f'(x)g(x) + f(x)g'(x)$
- **Quotient Rule**: $\\frac{d}{dx}\\left[\\frac{f(x)}{g(x)}\\right] = \\frac{f'(x)g(x) - f(x)g'(x)}{[g(x)]^2}$
- **Chain Rule**: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$

## Trigonometric Derivatives
- $\\frac{d}{dx}[\\sin x] = \\cos x$
- $\\frac{d}{dx}[\\cos x] = -\\sin x$
- $\\frac{d}{dx}[\\tan x] = \\sec^2 x$
- $\\frac{d}{dx}[\\sec x] = \\sec x \\tan x$`,
    relatedGem: 'cheatsheet',
    samplePrompt: 'Generate a customized Calculus cheat sheet for AP Exam prep'
  },
  {
    slug: 'spaced-repetition-flashcard-system',
    title: 'The Science of Spaced Repetition: How to Memorize 1,000 Facts with 15 Mins a Day',
    category: 'Memory & Learning Science',
    readTime: '6 min read',
    metaDesc: 'Learn how the Leitner 3-box spaced repetition system and active recall rewire your synapses for permanent long-term memory retention.',
    keyTopics: ['Spaced Repetition', 'Leitner System', 'Anki Algorithm', 'Active Recall'],
    summary: 'Cramming for 8 hours before an exam yields short-term illusion of competence. Spaced repetition reduces study time by 60% while doubling test scores.',
    contentMarkdown: `## Why Cramming Fails (The Synaptic Truth)
When you re-read highlighted textbook pages, your brain recognizes the words and mistakes **familiarity** for **mastery**. Active recall forces your brain to retrieve answers from scratch, strengthening synaptic pathways.

### The Leitner Box Interval Schedule
- **Box 1 (Daily)**: New cards and cards you got wrong.
- **Box 2 (Every 3 Days)**: Cards you answered correctly once.
- **Box 3 (Every 7 Days)**: Cards you answered correctly twice in a row.
- **Box 4 (Mastered / Every 2 Weeks)**: Permanent long-term memory.`,
    relatedGem: 'flashcards',
    samplePrompt: 'Create a flashcard deck from your lecture notes in 1-click.'
  },
  {
    slug: 'college-essay-thesis-guide',
    title: 'How to Write an Unstoppable Argumentative Essay Thesis & Outline',
    category: 'Academic Writing',
    readTime: '5 min read',
    metaDesc: 'Step-by-step formula for writing A+ college essays, strong argumentative thesis statements, evidence synthesis, and APA/MLA citations.',
    keyTopics: ['Essay Writing', 'Thesis Formula', 'Counterarguments', 'APA Citation'],
    summary: 'A bulletproof structural framework for structuring 1,500-word university research papers and argumentative essays.',
    contentMarkdown: `## The 3-Part Winning Thesis Formula
A strong academic thesis must never be a simple statement of fact. It must contain:
1. **The Counter-Argument (Although X...)**
2. **The Defensible Claim (...Y is true...)**
3. **The Evidence/Reasoning Matrix (...because of A, B, and C.)**

### Sample Formula Application
*Weak:* "Social media causes mental health problems in teenagers." (Vague, obvious)
*Strong:* "Although social media provides unprecedented peer connection, algorithmic engagement loops increase anxiety and sleep deprivation among adolescents by amplifying social comparison and disrupting circadian rhythms."`,
    relatedGem: 'essay',
    samplePrompt: 'Use StudyGem Essay Helper to outline your term paper.'
  }
];

export const AFFILIATE_STUDENT_DEALS: AffiliateDeal[] = [
  {
    id: 'notion-edu',
    partnerName: 'Notion for Education',
    category: 'Note Taking & Second Brain',
    discountBadge: '100% Free Pro Tier',
    description: 'Get Notion Plus Plan for free with any valid .edu student email address. Unlimited storage and page history.',
    couponCode: 'STUDENT_EDU',
    ctaText: 'Claim Free Student Pro',
    affiliateUrl: 'https://www.notion.so/students',
    logoIcon: 'Notebook'
  },
  {
    id: 'grammarly-edu',
    partnerName: 'Grammarly Premium',
    category: 'Academic Writing & Clarity',
    discountBadge: '20% Student Discount',
    description: 'Real-time tone polishing, citation checking, and essay clarity improvements for university papers.',
    couponCode: 'STUDENT20',
    ctaText: 'Get 20% Off',
    affiliateUrl: 'https://www.grammarly.com/students',
    logoIcon: 'Sparkles'
  },
  {
    id: 'audible-student',
    partnerName: 'Audible Student Pass',
    category: 'Audiobooks & Podcasts',
    discountBadge: '30-Day Free Trial + 33% Off',
    description: 'Listen to textbooks, literature assignments, and non-fiction summaries while commuting or walking.',
    couponCode: 'AUDIBLE_STUDENT',
    ctaText: 'Start Free 30-Day Pass',
    affiliateUrl: 'https://www.audible.com',
    logoIcon: 'Headphones'
  },
  {
    id: 'github-student',
    partnerName: 'GitHub Student Developer Pack',
    category: 'Coding & Cloud Credits',
    discountBadge: '$200k+ Free Tools',
    description: 'Free GitHub Copilot, DigitalOcean cloud credits, Namecheap domain, and JetBrains IDE suites.',
    couponCode: 'GITHUB_PACK',
    ctaText: 'Access Student Pack',
    affiliateUrl: 'https://education.github.com/pack',
    logoIcon: 'Code'
  }
];

export const STUDENT_DEALS = AFFILIATE_STUDENT_DEALS.map(d => ({
  ...d,
  title: d.partnerName,
  discountTag: d.discountBadge,
  code: d.couponCode
}));

export const SEO_STUDY_ARTICLES = SEO_STUDY_GUIDES.map(g => ({
  ...g,
  id: g.slug,
  excerpt: g.summary,
  content: g.contentMarkdown
}));

export const FREQUENT_QUESTIONS = [
  {
    question: 'How does StudyGem generate study notes from YouTube videos?',
    answer: 'StudyGem extracts the lecture transcripts and runs them through Google Gemini 2.5 Flash with specialized pedagogical prompting. It formats the output into the Cornell Note-Taking System (cues, detailed notes, bottom summary), along with clickable timestamps and active recall flashcards.'
  },
  {
    question: 'What is the Feynman Technique and how does StudyGem use it?',
    answer: 'The Feynman Technique is a mental model where you explain complex concepts in plain language as if teaching a beginner. StudyGem tests your explanations and builds simplified analogies to highlight hidden conceptual blindspots.'
  },
  {
    question: 'Can I export my flashcards to Anki or Quizlet?',
    answer: 'Yes! StudyGem provides a 1-click Anki CSV export formatted specifically for instant deck import into Anki, Quizlet, RemNote, or Notion.'
  },
  {
    question: 'How does the Leitner 3-box spaced repetition system work?',
    answer: 'Cards you find difficult stay in Box 1 (reviewed daily). Once you get them right, they advance to Box 2 (reviewed every 3 days), and eventually Box 3 (mastered, reviewed every 7 days). This eliminates wasted review time on concepts you already know.'
  },
  {
    question: 'Is StudyGem compliant with academic honor codes?',
    answer: 'Yes. StudyGem is designed as an interactive diagnostic study partner, active recall coach, and lecture summarizer—not an essay ghostwriter. It helps students understand foundational course concepts faster and test their own knowledge.'
  }
];

