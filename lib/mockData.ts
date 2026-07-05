export interface Post {
  id: string;
  author: string;
  avatar?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export const posts: Post[] = [
  {
    id: "1",
    author: "Ayesha Khan",
    title: "Looking for a teammate for Smart India Hackathon",
    content: "Need a backend dev (Node/Express) for a 36-hour hackathon next month. DM if interested!",
    tags: ["Hackathon"],
    createdAt: "2h ago",
  },
  {
    id: "2",
    author: "Rohit Verma",
    title: "Capstone project on IoT-based irrigation",
    content: "Looking for someone with Arduino/ESP32 experience to collaborate on my final year capstone.",
    tags: ["Capstone", "Robotics"],
    createdAt: "5h ago",
  },
  {
    id: "3",
    author: "Sneha Patil",
    title: "Content writer needed for tech blog",
    content: "Starting a campus tech blog, need 2-3 writers who can post weekly. Great for your portfolio!",
    tags: ["Content"],
    createdAt: "1d ago",
  },
  {
    id: "4",
    author: "Karan Mehta",
    title: "Co-founder wanted for campus delivery startup",
    content: "Building a hyperlocal delivery app for hostels. Looking for a technical co-founder.",
    tags: ["Startup"],
    createdAt: "2d ago",
  },
];