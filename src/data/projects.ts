export type QuestionType = 'number' | 'multiple-choice' | 'yes-no' | 'command-sequence';

export type MissionStep = {
  id: string;
  title: string;
  question: string;
  type: QuestionType;
  correctAnswer: string;
  options?: string[];
  unlockedTool: string;
  feedback: string;
};

export type Project = {
  id: string;
  title: string;
  world: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  scenario: string;
  concepts: string[];
  meterLabel: string;
  steps: MissionStep[];
  vrEnvironment: string;
  vrObjective: string;
  vrObjects: string[];
  finalTestButton: string;
  finalSuccessMessage: string;
  badge: string;
};

export const projects: Project[] = [
  {
    id: 'footbridge-stream',
    title: 'Build a Footbridge Over a Stream',
    world: 'Bridge Builder World',
    difficulty: 'Beginner',
    scenario:
      'A small stream separates two parts of a school/community compound. Students need a safe wooden footbridge to cross. The learner must design the bridge using measurement, addition, division, multiplication, and safety checks.',
    concepts: ['Length', 'Addition', 'Measurement', 'Division', 'Multiplication', 'Load Capacity'],
    meterLabel: 'Bridge Safety',
    vrEnvironment: 'Community Stream Crossing',
    vrObjective: 'Measure the stream, place wooden planks, add supports, and test whether the bridge is safe.',
    vrObjects: ['Stream Measuring Tape', 'Bridge Base', 'Wooden Planks', 'Width Boards', 'Support Posts', 'Safety Load Checker'],
    finalTestButton: 'Test Footbridge',
    finalSuccessMessage:
      'Safe for crossing. You used measurement, addition, division, multiplication, and safety checks to design a practical footbridge for your community.',
    badge: 'Community Bridge Builder',
    steps: [
      { id: 'stream-width', title: 'Measure the stream width', question: 'The stream is 4 metres wide. What minimum length must the bridge be to cross only the stream?', type: 'number', correctAnswer: '4', unlockedTool: 'Stream Measuring Tape', feedback: 'Correct. You measured the stream width as 4 metres.' },
      { id: 'safety-extensions', title: 'Add safety extensions', question: 'The bridge must extend 1 metre beyond the stream on the left side and 1 metre beyond the stream on the right side. What is the total bridge length?', type: 'number', correctAnswer: '6', unlockedTool: 'Bridge Base', feedback: 'Great. Your calculation added the full 6-metre bridge base.' },
      { id: 'wooden-planks', title: 'Calculate wooden planks', question: 'Each wooden plank is 1 metre long. The bridge is 6 metres long. How many planks are needed along the length?', type: 'number', correctAnswer: '6', unlockedTool: 'Wooden Planks', feedback: 'Correct. Six planks are needed along the bridge length.' },
      { id: 'width-boards', title: 'Calculate bridge width boards', question: 'Each walking board is 0.5 metres wide. The bridge needs a walking width of 1 metre. How many boards are needed across the width?', type: 'number', correctAnswer: '2', unlockedTool: 'Width Boards', feedback: 'Excellent. Two boards create a 1-metre walking width.' },
      { id: 'support-posts', title: 'Add support posts', question: 'Support posts are placed at 0m, 2m, 4m, and 6m. How many support positions are needed?', type: 'number', correctAnswer: '4', unlockedTool: 'Support Posts', feedback: 'Correct. Four support positions will strengthen the bridge.' },
      { id: 'safety-load', title: 'Check safety load', question: 'Each support position can carry 50kg. There are 4 support positions. What is the total safe load?', type: 'number', correctAnswer: '200', unlockedTool: 'Safety Load Checker', feedback: 'Correct. The bridge can safely carry 200kg.' },
    ],
  },
  {
    id: 'school-playground-layout',
    title: 'Plan a School Playground Layout',
    world: 'Smart City Designer',
    difficulty: 'Beginner',
    scenario: 'Design a safe playground by calculating area, perimeter, and spacing between play zones.',
    concepts: ['Area', 'Perimeter', 'Shapes', 'Scale Drawing'],
    meterLabel: 'Layout Safety',
    vrEnvironment: 'School Playground Planning Zone',
    vrObjective: 'Walk around the school grounds, measure the land, and place safe play zones.',
    vrObjects: ['Area Calculator', 'Perimeter Fence', 'Safety Zone Planner'],
    finalTestButton: 'Test Playground Layout',
    finalSuccessMessage: 'The playground layout is safe, spacious, and ready for students.',
    badge: 'Smart Playground Planner',
    steps: [
      { id: 'area', title: 'Calculate playground area', question: 'The playground is 20 metres long and 10 metres wide. What is the area?', type: 'number', correctAnswer: '200', unlockedTool: 'Area Calculator', feedback: 'Great. You calculated the playground area correctly.' },
      { id: 'perimeter', title: 'Calculate playground perimeter', question: 'What is the perimeter of a 20m by 10m playground?', type: 'number', correctAnswer: '60', unlockedTool: 'Perimeter Fence', feedback: 'Excellent. The perimeter fence can now be planned.' },
      { id: 'spacing', title: 'Choose safe spacing', question: 'Should play zones have enough space between them?', type: 'yes-no', correctAnswer: 'yes', unlockedTool: 'Safety Zone Planner', feedback: 'Correct. Safe spacing helps prevent accidents.' },
    ],
  },
  {
    id: 'ferry-river-crossing',
    title: 'Design a Ferry for River Crossing',
    world: 'Ship Engineering Bay',
    difficulty: 'Beginner',
    scenario: 'A community needs a ferry. Calculate passenger capacity, safety, and trip time.',
    concepts: ['Capacity', 'Counting', 'Weight', 'Time'],
    meterLabel: 'Ferry Safety',
    vrEnvironment: 'River Ferry Safety Dock',
    vrObjective: 'Load passengers safely, check capacity, and plan the ferry crossing.',
    vrObjects: ['Passenger Counter', 'Capacity Meter', 'Timetable Planner'],
    finalTestButton: 'Test Ferry Safety',
    finalSuccessMessage: 'The ferry is safely loaded and ready to cross the river.',
    badge: 'Ferry Safety Planner',
    steps: [
      { id: 'passengers', title: 'Calculate daily passengers', question: 'The ferry carries 10 passengers per trip. If it makes 5 trips, how many passengers can it carry?', type: 'number', correctAnswer: '50', unlockedTool: 'Passenger Counter', feedback: 'Correct. You calculated the total passengers.' },
      { id: 'overload', title: 'Check overload safety', question: 'If ferry capacity is 10 passengers, should 14 passengers enter at once?', type: 'yes-no', correctAnswer: 'no', unlockedTool: 'Capacity Meter', feedback: 'Good safety decision. The ferry must not be overloaded.' },
      { id: 'time', title: 'Calculate trip time', question: 'If one trip takes 20 minutes, how long will 3 trips take?', type: 'number', correctAnswer: '60', unlockedTool: 'Timetable Planner', feedback: 'Excellent. You calculated the ferry schedule.' },
    ],
  },
  {
    id: 'simple-cleaning-robot',
    title: 'Program a Simple Cleaning Robot',
    world: 'Robotics Arena',
    difficulty: 'Beginner',
    scenario: 'Program a classroom cleaning robot to move around desks and avoid obstacles.',
    concepts: ['Coordinates', 'Directions', 'Counting', 'Sequences'],
    meterLabel: 'Route Accuracy',
    vrEnvironment: 'Virtual Classroom Cleaning Lab',
    vrObjective: 'Use coordinates and directions to guide the robot safely through the classroom.',
    vrObjects: ['Coordinate Grid', 'Obstacle Detector', 'Direction Arrows'],
    finalTestButton: 'Start Cleaning Route',
    finalSuccessMessage: 'The robot completed the cleaning route without hitting any desks.',
    badge: 'Robot Route Starter',
    steps: [
      { id: 'move', title: 'Move robot on grid', question: 'The robot starts at A1. Move it 3 spaces forward. Which position does it reach?', type: 'multiple-choice', options: ['A2', 'A3', 'A4', 'B4'], correctAnswer: 'A4', unlockedTool: 'Coordinate Grid', feedback: 'Correct. The robot moved from A1 to A4.' },
      { id: 'avoid', title: 'Avoid obstacle', question: 'If a desk is at B2, should the robot move through B2?', type: 'yes-no', correctAnswer: 'no', unlockedTool: 'Obstacle Detector', feedback: 'Correct. The robot must avoid obstacles.' },
      { id: 'sequence', title: 'Choose command sequence', question: 'Which sequence moves two steps forward and one step right?', type: 'command-sequence', options: ['Forward, Forward, Right', 'Right, Back, Forward', 'Left, Left, Back', 'Forward, Right, Back'], correctAnswer: 'Forward, Forward, Right', unlockedTool: 'Direction Arrows', feedback: 'Excellent. You created the correct movement sequence.' },
    ],
  },
  {
    id: 'tomato-sales-market',
    title: 'Calculate Tomato Sales at Market',
    world: 'Farm & Market Maths',
    difficulty: 'Beginner',
    scenario: 'Help a tomato seller calculate total sales, profit, and business performance.',
    concepts: ['Money', 'Profit', 'Percentage', 'Multiplication'],
    meterLabel: 'Business Profit',
    vrEnvironment: 'Makola Market Tomato Stall',
    vrObjective: 'Count baskets, set prices, calculate profit, and check if the business is gaining.',
    vrObjects: ['Sales Calculator', 'Profit Meter', 'Business Checker'],
    finalTestButton: 'Calculate Market Result',
    finalSuccessMessage: 'The tomato seller made a profit and understands the business result.',
    badge: 'Market Maths Champion',
    steps: [
      { id: 'sales', title: 'Calculate total sales', question: 'A seller sells 5 baskets of tomatoes at GHS 20 each. What is the total sales amount?', type: 'number', correctAnswer: '100', unlockedTool: 'Sales Calculator', feedback: 'Correct. Total sales are GHS 100.' },
      { id: 'profit', title: 'Calculate profit', question: 'If sales were GHS 100 and cost was GHS 70, what is the profit?', type: 'number', correctAnswer: '30', unlockedTool: 'Profit Meter', feedback: 'Great. The profit is GHS 30.' },
      { id: 'decision', title: 'Make business decision', question: 'Should a seller calculate profit to know whether business is gaining or losing money?', type: 'yes-no', correctAnswer: 'yes', unlockedTool: 'Business Checker', feedback: 'Correct. Profit helps the seller make better business decisions.' },
    ],
  },
  {
    id: 'weather-balloon-launch',
    title: 'Launch a Weather Balloon',
    world: 'Space Mission Lab',
    difficulty: 'Beginner',
    scenario: 'Launch a weather balloon and use height-time data to predict its movement.',
    concepts: ['Height', 'Time', 'Data Collection', 'Prediction'],
    meterLabel: 'Mission Stability',
    vrEnvironment: 'Weather Balloon Launch Field',
    vrObjective: 'Launch a balloon, track its height, plot data, and predict its final height.',
    vrObjects: ['Height Tracker', 'Time Counter', 'Data Predictor'],
    finalTestButton: 'Launch Weather Balloon',
    finalSuccessMessage: 'The weather balloon launched successfully and reached the predicted height.',
    badge: 'Weather Data Explorer',
    steps: [
      { id: 'height', title: 'Calculate balloon height', question: 'The balloon rises 5 metres every minute. How high will it be after 6 minutes?', type: 'number', correctAnswer: '30', unlockedTool: 'Height Tracker', feedback: 'Correct. The balloon reaches 30 metres after 6 minutes.' },
      { id: 'rise', title: 'Calculate rise per minute', question: 'At 3 minutes, the balloon is 15m high. At 4 minutes, it is 20m high. How many metres did it rise in one minute?', type: 'number', correctAnswer: '5', unlockedTool: 'Time Counter', feedback: 'Excellent. The balloon rose 5 metres in one minute.' },
      { id: 'predict', title: 'Predict height', question: 'If the balloon keeps rising at the same rate, how high will it be after 10 minutes?', type: 'number', correctAnswer: '50', unlockedTool: 'Data Predictor', feedback: 'Great prediction. The balloon will reach 50 metres.' },
    ],
  },
];

export function getProjectById(id?: string) {
  return projects.find((project) => project.id === id);
}
