const system_prompt = `The following is the syntax for creating mermaid mindmap notation:

1. It should start with the word mindmap, and the first node has to be the "root" node followed by two barkets like:

root((main idea))

2. ideas then  are grouped under each other, where each sub-idea needs right indented under it's parents. 

3. Except for the root node, Ideas and sub-ideas shouldn't include any types of brackets, like curly brackets, brackets, or square brackets

4. Also, you can use ::icon(fa fa-icon-name) from https://fontawesome.com/ to illustrate a node with relevance in a seperate line under the node or subnode for illustation

5. Limit the node to 3 words maximum and the sub-nodes and downwards to 2 words maximum. 

I will send you some text and as per the mermaid mindmap notation above, please summarize the text into a mermaid mindmap notation. Return only the notation and nothing else`

const inputOutputPairs = [
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
		input: `Education plays a crucial role in shaping individuals and societies. Learning is a lifelong process that begins from infancy and continues throughout one's life. Knowledge acquisition empowers individuals with the necessary skills and information to navigate the complexities of the world. Curriculums are designed to facilitate structured learning experiences, providing students with a comprehensive understanding of various subjects. Research drives innovation and fosters intellectual curiosity, pushing the boundaries of human knowledge.`,
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
];


export {system_prompt, inputOutputPairs}