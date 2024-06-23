const createMindmapSystemPrompt = `The following is the syntax for creating mermaid mindmap notation:

1. It should start with the word mindmap, and the first node has to be the "root" node followed by two barkets like:

root((main idea))

2. ideas then  are grouped under each other, where each sub-idea needs right indented under it's parents. 

3. Except for the root node, Ideas and sub-ideas shouldn't include any types of brackets, like curly brackets, brackets, or square brackets

4. Also, you can use ::icon(fa fa-icon-name) from https://fontawesome.com/ to illustrate a node with relevance in a seperate line under the node or subnode for illustation

5. Limit the node to 3 words maximum and the sub-nodes and downwards to 2 words maximum. 

I will send you an optional instruction and some text and as per the mermaid mindmap notation above, please summarize the text into a mermaid mindmap notation according to the instruction if present. If only instruction and no text is given, you have to make the mindmap according to the instruction. Return only MERMAID MINDMAP CODE. DO NOT RETURN TEXT. DO NOT RETURN TEXT DESCRIPTIONS, UNDERSTANDINGS, OR ANYTHING ELSE.`;

const textMindmapInputOutputPairs = [
	{
		input: `Technology has greatly influenced modern society. It encompasses various aspects of human life, from communication to transportation. Innovation drives technological advancements, leading to new products and services that enhance our daily lives. Automation, a significant outcome of technological progress, streamlines processes and improves efficiency. Artificial Intelligence (AI) represents the cutting edge of technology, enabling machines to perform tasks that typically require human intelligence.`,
		output: `mindmap
root((Technology))
    Influence
        Communication
        Transportation
    Innovation
        New Products
        Enhanced Services
    Advancement
        Streamlined Processes
        Improved Efficiency
            Automation
        Cutting Edge
            Artificial Intelligence
            ::icon(fa fa-cogs)
`,
	},
	{
		input: `Travel broadens one's horizons and exposes individuals to diverse cultures and experiences. Exploration fuels the desire to discover new places and uncover hidden treasures. Adventure seekers often embark on thrilling journeys, seeking adrenaline-pumping activities and unique encounters. Backpacking offers a sense of freedom and allows travelers to immerse themselves in nature while Safari adventures provide opportunities to observe wildlife in their natural habitats.`,
		output: `mindmap
root((Travel))
    Broadening Horizons
        Exposure to Cultures
        Diverse Experiences
    Exploration
        Discovering New Places
        Uncovering Hidden Treasures
    Adventure
        Thrilling Journeys
            Adrenaline-pumping Activities
            Unique Encounters
        Backpacking
        ::icon(fa fa-hiking)
            Sense of Freedom
            Immersion in Nature
        Safari
        ::icon(fa fa-binoculars)
            Wildlife Observation
            Natural Habitats
`,
	},
	{
		input: `Convert the following text into a mindmap
Education plays a crucial role in shaping individuals and societies. Learning is a lifelong process that begins from infancy and continues throughout one's life. Knowledge acquisition empowers individuals with the necessary skills and information to navigate the complexities of the world. Curriculums are designed to facilitate structured learning experiences, providing students with a comprehensive understanding of various subjects. Research drives innovation and fosters intellectual curiosity, pushing the boundaries of human knowledge.`,
		output: `mindmap
root((Education))
    Shaping Individuals and Societies
        Crucial Role
    Learning
        Lifelong Process
            From Infancy
            Throughout Life
    Knowledge
        Empowerment
            Skills Acquisition
            Information Access
    Curriculums
        Structured Learning
            Comprehensive Understanding
                Various Subjects
    Research
    ::icon(fa fa-flask)
        Innovation Drive
        Intellectual Curiosity
            Pushing Boundaries
                Human Knowledge
`,
	},
	{
		input: `Create a mindmap about biology`,
		output: `mindmap
root((Biology))
    Study
        Life Forms
            ::icon(fa fa-leaf) Plants
            ::icon(fa fa-paw) Animals
            ::icon(fa fa-microscope) Microorganisms
        Processes
            ::icon(fa fa-dna) Genetics
            ::icon(fa fa-flask) Biochemistry
            ::icon(fa fa-seedling) Ecology
    Branches
        ::icon(fa fa-leaf) Botany
            ::icon(fa fa-tree) Plant Anatomy
            ::icon(fa fa-leaf) Plant Physiology
            ::icon(fa fa-seedling) Plant Taxonomy
        ::icon(fa fa-paw) Zoology
            ::icon(fa fa-dove) Ornithology
            ::icon(fa fa-fish) Ichthyology
            ::icon(fa fa-bug) Entomology
        ::icon(fa fa-microscope) Microbiology
            ::icon(fa fa-virus) Virology
            ::icon(fa fa-bacterium) Bacteriology
            ::icon(fa fa-vial) Immunology
    Importance
        Understanding Life
            ::icon(fa fa-heartbeat) Physiology
            ::icon(fa fa-brain) Behavior
            ::icon(fa fa-child) Development
        Medical Advances
            ::icon(fa fa-medkit) Medicine
            ::icon(fa fa-dna) Genetic Engineering
            ::icon(fa fa-microscope) Microbiology
        Environmental Conservation
            ::icon(fa fa-tree) Biodiversity
            ::icon(fa fa-leaf) Ecosystems
            ::icon(fa fa-globe) Conservation Biology
`,
	},
];

const updateMindmapSystemPrompt = `The following is the syntax for creating mermaid mindmap notation:

1. It should start with the word mindmap, and the first node has to be the "root" node followed by two brackets like:

root((main idea))

2. Ideas then are grouped under each other, where each sub-idea needs to be right indented under its parents.

3. Except for the root node, ideas and sub-ideas shouldn't include any types of brackets, like curly brackets, brackets, or square brackets.

4. Also, you can use ::icon(fa fa-icon-name) from https://fontawesome.com/ to illustrate a node with relevance in a separate line under the node or subnode for illustration.

5. Limit the node to 3 words maximum and the sub-nodes and downwards to 2 words maximum.

I will send you a pair of Mermaid mindmap code and an instruction. Modify the mindmap code according to the instruction provided complying with the notations provided above. Return only MERMAID MINDMAP CODE. DO NOT RETURN TEXT. DO NOT RETURN TEXT DESCRIPTIONS, UNDERSTANDINGS, OR ANYTHING ELSE.`;

const updateMindmapInputOutputPairs = [
	{
		input: `Instruction: Add a new sub-node "Creativity" under the "Innovation" node in the mindmap.
Mindmap Code: mindmap
root((Technology))
    Influence
        Communication
        Transportation
    Innovation
        New Products
        Enhanced Services
    Advancement
        Improved Efficiency
            Automation
        Cutting Edge
            Artificial Intelligence
            ::icon(fa fa-cogs)`,
		output: `mindmap
root((Technology))
    Influence
        Communication
        Transportation
    Innovation
        New Products
        Enhanced Services
        Creativity
    Advancement
        Improved Efficiency
            Automation
        Cutting Edge
            Artificial Intelligence
            ::icon(fa fa-cogs)
`,
	},
	{
		input: `Instruction: Change "Sense of Freedom" to "Feeling of Liberation" under the "Backpacking" node in the mindmap.
Mindmap Code: mindmap
root((Travel))
    Broadening Horizons
        Exposure to Cultures
        Diverse Experiences
    Exploration
        Discovering New Places
        Uncovering Hidden Treasures
    Adventure
        Thrilling Journeys
            Adrenaline-pumping Activities
            Unique Encounters
        Backpacking
            Sense of Freedom
            Immersion in Nature
        Safari
            Wildlife Observation
            Natural Habitats
`,
		output: `mindmap
root((Travel))
    Broadening Horizons
        Exposure to Cultures
        Diverse Experiences
    Exploration
        Discovering New Places
        Uncovering Hidden Treasures
    Adventure
        Thrilling Journeys
            Adrenaline-pumping Activities
            Unique Encounters
        Backpacking
            Feeling of Liberation
            Immersion in Nature
        Safari
            Wildlife Observation
            Natural Habitats
`,
	},
	{
		input: `Instruction: Remove the "Empowerment" node from the mindmap.
Mindmap Code: mindmap
root((Education))
    Shaping Individuals and Societies
        Crucial Role
    Learning
        Lifelong Process
            From Infancy
            Throughout Life
    Knowledge
        Empowerment
            Skills Acquisition
            Information Access
    Curriculums
        Structured Learning
            Comprehensive Understanding
                Various Subjects
    Research
    ::icon(fa fa-flask)
        Innovation Drive
        Intellectual Curiosity
            Pushing Boundaries
                Human Knowledge`,
		output: `mindmap
root((Education))
    Shaping Individuals and Societies
        Crucial Role
    Learning
        Lifelong Process
            From Infancy
            Throughout Life
    Knowledge
        Skills Acquisition
        Information Access
    Curriculums
        Structured Learning
            Comprehensive Understanding
                Various Subjects
    Research
    ::icon(fa fa-flask)
        Innovation Drive
        Intellectual Curiosity
            Pushing Boundaries
                Human Knowledge
`,
	},
	{
		input: `Instruction: Change the icon of "Innovation" node to fa-lightbulb-o in the mindmap.
Mindmap Code: mindmap
root((Technology))
    Influence
        Communication
        Transportation
    Innovation
        New Products
        Enhanced Services
    Advancement
        Improved Efficiency
            Automation
        Cutting Edge
            Artificial Intelligence
            ::icon(fa fa-cogs)`,
		output: `mindmap
root((Technology))
    Influence
        Communication
        Transportation
    Innovation
        New Products
        Enhanced Services
            ::icon(fa fa-lightbulb-o)
    Advancement
        Improved Efficiency
            Automation
        Cutting Edge
            Artificial Intelligence
            ::icon(fa fa-cogs)
`,
	},
	{
		input: `Instruction: Add a new sub-node "Coding Skills" under "Skills Acquisition" in the mindmap.
Mindmap Code: mindmap
root((Education))
    Shaping Individuals and Societies
        Crucial Role
    Learning
        Lifelong Process
            From Infancy
            Throughout Life
    Knowledge
        Empowerment
            Skills Acquisition
                Language Proficiency
                Problem Solving
            Information Access
    Curriculums
        Structured Learning
            Comprehensive Understanding
                Various Subjects
    Research
    ::icon(fa fa-flask)
        Innovation Drive
        Intellectual Curiosity
            Pushing Boundaries
                Human Knowledge`,
		output: `mindmap
root((Education))
    Shaping Individuals and Societies
        Crucial Role
    Learning
        Lifelong Process
            From Infancy
            Throughout Life
    Knowledge
        Empowerment
            Skills Acquisition
                Language Proficiency
                Problem Solving
                Coding Skills
            Information Access
    Curriculums
        Structured Learning
            Comprehensive Understanding
                Various Subjects
    Research
    ::icon(fa fa-flask)
        Innovation Drive
        Intellectual Curiosity
            Pushing Boundaries
                Human Knowledge
`,
	},
];

const updateMindmapPrompt = `Instruction: [INSTRUCTION]
Mindmap Code: [MERMAID_MINDMAP_CODE]`;

export { createMindmapSystemPrompt, textMindmapInputOutputPairs, updateMindmapSystemPrompt, updateMindmapInputOutputPairs, updateMindmapPrompt};
