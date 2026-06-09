export const EXPERIMENT_CATALOG = [
  {
    id: "human-body",
    title: "Human Body Anatomy",
    description: "Explore full human body systems in 3D",
    subject: "biology",
    link: "/biology/human-body",
    difficulty: "Beginner",
    concepts: ["Anatomy", "Organ Systems"],
    prerequisites: [],
    nextTopics: ["eye", "kidney", "mitochondria"]
  },
  {
    id: "mitochondria",
    title: "Mitochondria",
    description: "Study the powerhouse of the cell",
    subject: "biology",
    link: "/biology/mitochondria",
    difficulty: "Intermediate",
    concepts: ["Cellular Biology", "Energy Production"],
    prerequisites: ["human-body"],
    nextTopics: []
  },
  {
    id: "eye",
    title: "Eye Anatomy",
    description: "Understand structure and function of the eye",
    subject: "biology",
    link: "/biology/eye",
    difficulty: "Intermediate",
    concepts: ["Sensory Organs", "Optics"],
    prerequisites: ["human-body"],
    nextTopics: ["kidney"]
  },
  {
    id: "kidney",
    title: "Kidney Anatomy",
    description: "Learn how kidneys filter blood",
    subject: "biology",
    link: "/biology/kidney",
    difficulty: "Advanced",
    concepts: ["Excretory System", "Filtration"],
    prerequisites: ["human-body", "eye"],
    nextTopics: []
  },
  {
    id: "chemistry-equipment",
    title: "Chemistry Equipment",
    description: "Learn about laboratory apparatus",
    subject: "chemistry",
    link: "/chemistry/chemistry-equipment",
    difficulty: "Beginner",
    concepts: ["Lab Safety", "Apparatus"],
    prerequisites: [],
    nextTopics: ["volcano-experiment", "condenser"]
  },
  {
    id: "volcano-experiment",
    title: "Volcano Experiment",
    description: "Visualize a chemical reaction",
    subject: "chemistry",
    link: "/chemistry/volcano-experiment",
    difficulty: "Beginner",
    concepts: ["Chemical Reactions", "Gas Production"],
    prerequisites: ["chemistry-equipment"],
    nextTopics: ["acid-base-neutralization"]
  },
  {
    id: "condenser",
    title: "Condenser",
    description: "Understand distillation apparatus",
    subject: "chemistry",
    link: "/chemistry/condenser",
    difficulty: "Intermediate",
    concepts: ["Separation Techniques", "Distillation"],
    prerequisites: ["chemistry-equipment"],
    nextTopics: []
  },
  {
    id: "acid-base-neutralization",
    title: "Acid Base Neutralization",
    description: "Observe how acids and bases react to form salt and water",
    subject: "chemistry",
    link: "/chemistry/acid-base-neutralization",
    difficulty: "Advanced",
    concepts: ["Acids", "Bases", "Titration"],
    prerequisites: ["volcano-experiment"],
    nextTopics: ["titration-experiment"]
  },
  {
    id: "titration-experiment",
    title: "Acid-Base Titration",
    description: "Simulation of an acid-base titration process",
    subject: "chemistry",
    link: "/chemistry/titration-experiment",
    difficulty: "Advanced",
    concepts: ["Acids", "Bases", "Titration"],
    prerequisites: ["acid-base-neutralization"],
    nextTopics: []
  },
  {
    id: "velocity-acceleration",
    title: "Velocity & Acceleration",
    description: "Understand motion concepts",
    subject: "physics",
    link: "/physics/velocity-acceleration",
    difficulty: "Beginner",
    concepts: ["Kinematics", "Motion Vectors"],
    prerequisites: [],
    nextTopics: ["thumb-rule"]
  },
  {
    id: "magnetic-field-wires",
    title: "Magnetic Field (Two Wires)",
    description: "Interaction of magnetic fields",
    subject: "physics",
    link: "/physics/magnetic-field-wires",
    difficulty: "Intermediate",
    concepts: ["Electromagnetism", "Magnetic Forces"],
    prerequisites: ["thumb-rule"],
    nextTopics: ["magnetic-field-direction"]
  },
  {
    id: "thumb-rule",
    title: "Right-Hand Thumb Rule",
    description: "Direction of magnetic field",
    subject: "physics",
    link: "/physics/thumb-rule",
    difficulty: "Beginner",
    concepts: ["Electromagnetism", "Vector Rules"],
    prerequisites: ["velocity-acceleration"],
    nextTopics: ["magnetic-field-wires"]
  },
  {
    id: "magnetic-field-direction",
    title: "Magnetic Field Direction",
    description: "Field around straight conductor",
    subject: "physics",
    link: "/physics/magnetic-field-direction",
    difficulty: "Advanced",
    concepts: ["Magnetic Flux", "Currents"],
    prerequisites: ["magnetic-field-wires"],
    nextTopics: []
  },
  {
    id: "solar-system",
    title: "Solar System",
    description: "Explore planets and the structure of the solar system in 3D",
    subject: "physics",
    link: "/physics/solar-system",
    difficulty: "Beginner",
    concepts: ["Astronomy", "Gravity"],
    prerequisites: [],
    nextTopics: []
  },
  {
  id: "geometry-shapes",
  subject: "mathematics",
  title: "Geometry Shapes",
  description: "Visualize geometric figures interactively with dynamic diagrams."
},
{
  id: "probability-simulator",
  subject: "mathematics",
  title: "Probability Simulator",
  description: "Experiment with randomness and probability distributions."
}

];

export const SUBJECTS = ["biology", "chemistry", "physics", "mathematics"];
