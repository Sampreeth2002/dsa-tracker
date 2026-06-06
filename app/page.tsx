'use client';
import { useState, useEffect, useMemo } from 'react';

type Problem = { id: string; title: string; sde: boolean; day: string };

const revisionNotes: Record<string, string> = {
  "Fri, Jun 5": "🔁 Revision (1h): DP Intro — Fibonacci, Climbing Stairs, Frog Jump (re-derive recurrences)",
  "Sat, Jun 6": "🔁 Revision (3h): Full DP recap — House Robber, Grid DP, Subset Sum, 0/1 Knapsack, Coin Change (re-solve 3 weakest)",
  "Sun, Jun 7": "🔁 Revision (3h): DP Strings + Stocks + LIS — re-solve LCS, Edit Distance, Best Time IV, LIS optimal",
  "Mon, Jun 8": "🔁 Revision (1h): DP on Stocks (Buy/Sell I–IV) — re-derive states",
  "Tue, Jun 9": "🔁 Revision (1h): DP on LIS — print LIS, longest bitonic, longest string chain",
  "Wed, Jun 10": "🔁 Revision (1h): MCM / Partition DP — re-solve Burst Balloons + Palindrome Part II",
  "Thu, Jun 11": "🔁 Revision (1h): DP on Squares + Egg Drop + Job Scheduling",
  "Fri, Jun 12": "🔁 Revision (1h): Tries — re-implement Trie I + XOR Max + Distinct Substrings",
  "Sat, Jun 13": "🔁 Revision (3h): Graph BFS/DFS — re-solve Islands, Rotten Oranges, Bipartite, Topo Sort",
  "Sun, Jun 14": "🔁 Revision (3h): Shortest Path — Dijkstra, Bellman-Ford, Floyd Warshall, Cheapest Flights",
  "Mon, Jun 15": "🔁 Revision (1h): MST + DSU — Prim, Kruskal, Network Connected, Accounts Merge",
  "Tue, Jun 16": "🔁 Revision (1h): Graph Hard — Bridges, Articulation Points, Kosaraju",
  "Wed, Jun 17": "🔁 Revision (1h): Graph traversal — Word Ladder I/II, Number of Distinct Islands",
  "Thu, Jun 18": "🔁 Revision (1h): BT Traversals — pre/in/post (rec + iter) + Morris",
  "Fri, Jun 19": "🔁 Revision (1h): BT Medium — LCA, Diameter, Max Path Sum, Boundary",
  "Sat, Jun 20": "🔁 Revision (3h): BT Hard — Serialize/Deserialize, Flatten, Construct BT (Pre+In, Post+In)",
  "Sun, Jun 21": "🔁 Revision (3h): BST — Validate, LCA, Kth Smallest, BST Iterator, Largest BST in BT",
  "Mon, Jun 22": "🔁 Revision (1h): Adv Strings — KMP, Z-algo, Rabin-Karp templates",
  "Tue, Jun 23": "🔁 Revision (1h): Stack basics — Implement Stack/Queue Arrays + LL + Balanced Parens",
  "Wed, Jun 24": "🔁 Revision (1h): Expression conversions (all 6) — drill once",
  "Thu, Jun 25": "🔁 Revision (1h): NGE family — re-solve NGE I/II + Next Smaller + Trapping Rain Water",
  "Fri, Jun 26": "🔁 Revision (1h): Stack hard — Stock Span, Asteroid, Largest Rect Histogram",
  "Sat, Jun 27": "🔁 Revision (3h): Stack Hard + Cache — Largest Rect, Sliding Window Max, LRU, LFU",
  "Sun, Jun 28": "🔁 Revision (3h): BT + BST full sweep — re-solve 5 weakest from views/LCA/BST iterator",
  "Mon, Jun 29": "🔁 Revision (1h): Heaps medium — Kth Largest, Sort K Sorted, Merge K Sorted",
  "Tue, Jun 30": "🔁 Revision (1h): Heaps hard — Median Stream, Top K Freq, Task Scheduler",
  "Wed, Jul 1": "🔁 Revision (1h): Recursion patterns — pick/not-pick, subset generation",
  "Thu, Jul 2": "🔁 Revision (1h): Combination Sum I/II/III, Subset Sum I/II",
  "Fri, Jul 3": "🔁 Revision (1h): Backtracking templates — N-Queens, Sudoku, Permutations",
  "Sat, Jul 4": "🔁 Revision (3h): Recursion + Backtracking full sweep — Combo Sum I/II/III, Subset Sum, Palindrome Part, M-Coloring",
  "Sun, Jul 5": "🔁 Revision (3h): Word Break, Word Search, Rat in Maze + LL Insertion/Deletion drills",
  "Mon, Jul 6": "🔁 Revision (1h): Reverse LL (iter + rec), Floyd's cycle detection, Find Middle",
  "Tue, Jul 7": "🔁 Revision (1h): Palindrome LL, Intersection, Add Two Numbers, Reverse K-Group",
  "Wed, Jul 8": "🔁 Revision (1h): LL Hard — Flatten, Clone Random, Merge K Sorted",
  "Thu, Jul 9": "🔁 Revision (1h): LL Medium — Find Middle, Detect Cycle, Reverse K-Group",
  "Fri, Jul 10": "🔁 Revision (1h): Greedy classics — N Meetings, Job Sequencing, Min Platforms",
  "Sat, Jul 11": "🔁 Revision (3h): Stack/Queue full sweep — Min Stack, Largest Rect, LRU, Sliding Window Max",
  "Sun, Jul 12": "🔁 Revision (3h): Heaps full sweep — Median Stream, Top K Freq, Kth Largest Stream, Connect Sticks",
  "Mon, Jul 13": "🔁 Revision (1h): Arrays easy — Two Sum, Kadane, Dutch Flag, Best Time Buy Sell",
  "Tue, Jul 14": "🔁 Revision (1h): Greedy + Intervals — Merge Intervals, N Meetings, Job Sequencing",
  "Wed, Jul 15": "🔁 Revision (1h): LL Hard — Flatten, Clone Random, Merge K Sorted",
  "Thu, Jul 16": "🔁 Revision (1h): Arrays hard — 3-Sum, 4-Sum, Merge Overlapping, Count Inversions",
  "Fri, Jul 17": "🔁 Revision (1h): Recursion / Backtracking — N-Queens, Sudoku, Combo Sum",
  "Sat, Jul 18": "🔁 Revision (3h): Trees + BST full sweep — Serialize/Deserialize, LCA, Validate BST, BST Iterator, Largest BST",
  "Sun, Jul 19": "🔁 Revision (3h): Graphs full sweep — Dijkstra, Bellman-Ford, Prim, Kruskal, Kosaraju, Bridges",
  "Mon, Jul 20": "🔁 Revision (1h): BS on Answers — Aggressive Cows, Book Allocation, Koko, Smallest Divisor",
  "Tue, Jul 21": "🔁 Revision (1h): BS rotated — Rotated I/II, Find Min, Single Element, How Many Rotations",
  "Wed, Jul 22": "🔁 Revision (1h): 2D BS — Search Matrix I/II, Peak 2D, Median Row-wise",
  "Thu, Jul 23": "🔁 Revision (1h): Strings basic — LCP, Reverse Words, Roman/Int, Isomorphic",
  "Fri, Jul 24": "🔁 Revision (1h): Strings hard — Longest Palindromic Substring, Atoi, KMP/Z-algo",
  "Sat, Jul 25": "🔁 Revision (3h): Arrays full sweep — Kadane, Dutch Flag, 3-Sum, 4-Sum, Repeating/Missing, Reverse Pairs, Max Product Subarray",
  "Sun, Jul 26": "🔁 Final Revision (3h): Re-solve ALL 🔴 flagged + 🟡 flagged from DP/Graphs/Trees/Backtracking + Mock Interview",
};

// Stage-based spaced repetition.
// review_count in DB = which stage the problem is at (0-4).
// A problem only appears in the revision queue when daysAgo >= SR_STAGES[review_count].nextInterval.
// After "Recalled ✓": review_count++ → problem disappears until the NEXT stage's interval.
// This means clicking recalled on Jun 7 (stage 0, 1-day) won't show it on Jun 8 again;
// it shows next on Jun 10 (stage 1, 3-day from Jun 7).
const SR_STAGES = [
  { nextInterval: 1,  label: '1-day'   },  // stage 0 → first review, 1 day after solving
  { nextInterval: 3,  label: '3-day'   },  // stage 1 → 3 days after 1st recall
  { nextInterval: 7,  label: '1-week'  },  // stage 2 → 7 days after 2nd recall
  { nextInterval: 14, label: '2-week'  },  // stage 3 → 14 days after 3rd recall
  { nextInterval: 30, label: '1-month' },  // stage 4 → 30 days after 4th recall
  // review_count ≥ 5 → fully learned, no more scheduled reviews
];
const SR_COLOR      = 'bg-slate-800/70 border-slate-600/50 text-slate-300';
const OVERDUE_COLOR = 'bg-rose-950/50 border-rose-700/50 text-rose-300';
const OVERDUE_DAILY_CAP = 10;

const dataset: Record<string, Problem[]> = {
  "PHASE 1: DYNAMIC PROGRAMMING": [
    {id:"p1-1", title:"Fibonacci Number", sde:false, day:"Mon, Apr 27"},
    {id:"p1-2", title:"Climbing Stairs / Count Ways to Reach Nth Stair", sde:false, day:"Mon, Apr 27"},
    {id:"p1-3", title:"Frog Jump (DP-3)", sde:false, day:"Mon, Apr 27"},
    {id:"p1-4", title:"Frog Jump with K Distances (DP-4)", sde:false, day:"Tue, Apr 28"},
    {id:"p1-5", title:"Maximum Sum of Non-Adjacent Elements (House Robber)", sde:false, day:"Tue, Apr 28"},
    {id:"p1-6", title:"House Robber II (Circular)", sde:false, day:"Wed, Apr 29"},
    {id:"p1-7", title:"Ninja's Training (2D DP intro)", sde:false, day:"Wed, Apr 29"},
    {id:"p1-8", title:"Grid Unique Paths (Count paths)", sde:true, day:"Thu, Apr 30"},
    {id:"p1-9", title:"Grid Unique Paths 2 (With obstacles)", sde:false, day:"Thu, Apr 30"},
    {id:"p1-10", title:"Minimum Path Sum in Grid", sde:true, day:"Fri, May 1"},
    {id:"p1-11", title:"Triangle — Minimum Path Sum", sde:false, day:"Fri, May 1"},
    {id:"p1-12", title:"Minimum Falling Path Sum", sde:false, day:"Sat, May 2"},
    {id:"p1-13", title:"Maximum Falling Path Sum", sde:false, day:"Sat, May 2"},
    {id:"p1-14", title:"Cherry Pickup (3D DP)", sde:false, day:"Sat, May 2"},
    {id:"p1-15", title:"Chocolate Pickup (3D DP variant)", sde:false, day:"Sat, May 2"},
    {id:"p1-16", title:"Subset Sum Equal to Target", sde:true, day:"Sat, May 2"},
    {id:"p1-17", title:"Partition Equal Subset Sum", sde:false, day:"Sat, May 2"},
    {id:"p1-18", title:"Count Subsets with Sum K", sde:false, day:"Sat, May 2"},
    {id:"p1-19", title:"Count Partitions with Given Difference", sde:false, day:"Sat, May 2"},
    {id:"p1-20", title:"0/1 Knapsack", sde:true, day:"Sun, May 3"},
    {id:"p1-21", title:"Minimum Coins (Coin Change)", sde:true, day:"Sun, May 3"},
    {id:"p1-22", title:"Target Sum", sde:false, day:"Sun, May 3"},
    {id:"p1-23", title:"Coin Change 2 (Count Ways)", sde:false, day:"Sun, May 3"},
    {id:"p1-24", title:"Unbounded Knapsack", sde:false, day:"Sun, May 3"},
    {id:"p1-25", title:"Rod Cutting Problem", sde:true, day:"Sun, May 3"},
    {id:"p1-26", title:"Longest Common Subsequence (LCS)", sde:true, day:"Sun, May 3"},
    {id:"p1-27", title:"Print Longest Common Subsequence", sde:false, day:"Mon, May 4"},
    {id:"p1-28", title:"Longest Common Substring", sde:false, day:"Mon, May 4"},
    {id:"p1-29", title:"Shortest Common Supersequence", sde:false, day:"Tue, May 5"},
    {id:"p1-30", title:"Minimum Insertions to Convert String A to B", sde:false, day:"Tue, May 5"},
    {id:"p1-31", title:"Minimum Deletions to Convert String A to B", sde:false, day:"Tue, May 5"},
    {id:"p1-32", title:"Distinct Subsequences", sde:false, day:"Wed, May 6"},
    {id:"p1-33", title:"Edit Distance", sde:true, day:"Wed, May 6"},
    {id:"p1-34", title:"Wildcard Matching", sde:false, day:"Thu, May 7"},
    {id:"p1-35", title:"Best Time to Buy and Sell Stock I", sde:false, day:"Thu, May 7"},
    {id:"p1-36", title:"Best Time to Buy and Sell Stock II", sde:false, day:"Thu, May 7"},
    {id:"p1-37", title:"Best Time to Buy and Sell Stock III", sde:false, day:"Fri, May 8"},
    {id:"p1-38", title:"Best Time to Buy and Sell Stock IV", sde:false, day:"Fri, May 8"},
    {id:"p1-39", title:"Buy and Sell Stock with Cooldown", sde:false, day:"Sat, May 9"},
    {id:"p1-40", title:"Buy and Sell Stock with Transaction Fee", sde:false, day:"Sat, May 9"},
    {id:"p1-41", title:"Longest Increasing Subsequence — Recursion (Pick/Not-Pick)", sde:true, day:"Sat, May 9"},
    {id:"p1-42", title:"Longest Increasing Subsequence — Binary Search (Patience)", sde:true, day:"Sat, May 9"},
    {id:"p1-43", title:"Longest Increasing Subsequence — DP O(n²) optimal", sde:true, day:"Sat, May 9"},
    {id:"p1-44", title:"Print Longest Increasing Subsequence", sde:false, day:"Sat, May 9"},
    {id:"p1-45", title:"Largest Divisible Subset", sde:false, day:"Sat, May 9"},
    {id:"p1-46", title:"Longest String Chain", sde:false, day:"Sat, May 9"},
    {id:"p1-47", title:"Longest Bitonic Subsequence", sde:false, day:"Sat, May 9"},
    {id:"p1-48", title:"Number of Longest Increasing Subsequences", sde:false, day:"Sat, May 9"},
    {id:"p1-49", title:"Matrix Chain Multiplication (MCM)", sde:true, day:"Sun, May 10"},
    {id:"p1-50", title:"Minimum Cost to Cut a Stick", sde:false, day:"Sun, May 10"},
    {id:"p1-51", title:"Burst Balloons", sde:false, day:"Sun, May 10"},
    {id:"p1-52", title:"Evaluate Boolean Expression to True", sde:false, day:"Sun, May 10"},
    {id:"p1-53", title:"Palindrome Partitioning II (Min Cuts)", sde:true, day:"Sun, May 10"},
    {id:"p1-54", title:"Partition Array for Maximum Sum", sde:false, day:"Sun, May 10"},
    {id:"p1-55", title:"Count Square Submatrices with All 1s", sde:false, day:"Sun, May 10"},
    {id:"p1-56", title:"Maximal Rectangle", sde:true, day:"Sun, May 10"},
    {id:"p1-57", title:"Egg Dropping Puzzle", sde:true, day:"Sun, May 10"},
    {id:"p1-58", title:"Maximum Profit in Job Scheduling", sde:true, day:"Sun, May 10"},
  ],
  "PHASE 2: TRIES": [
    {id:"p2-1", title:"Implement Trie (Insert, Search, StartsWith)", sde:true, day:"Mon, May 11"},
    {id:"p2-2", title:"Implement Trie II (Insert, countWordsEqualTo, countWordsStartingWith)", sde:true, day:"Mon, May 11"},
    {id:"p2-3", title:"Complete String (Longest Word with All Prefixes)", sde:true, day:"Mon, May 11"},
    {id:"p2-4", title:"Number of Distinct Substrings in a String (using Trie)", sde:true, day:"Tue, May 12"},
    {id:"p2-5", title:"Maximum XOR of Two Numbers in an Array", sde:true, day:"Tue, May 12"},
    {id:"p2-6", title:"Maximum XOR With an Element From Array", sde:true, day:"Wed, May 13"},
    {id:"p2-7", title:"Power Set using Trie", sde:false, day:"Wed, May 13"},
  ],
  "PHASE 3: GRAPHS": [
    {id:"p3-1", title:"Graph Representation (Adjacency List / Matrix)", sde:false, day:"Fri, Jun 5"},
    {id:"p3-2", title:"Clone a Graph", sde:true, day:"Fri, Jun 5"},
    {id:"p3-3", title:"BFS Traversal of Graph", sde:true, day:"Fri, Jun 5"},
    {id:"p3-4", title:"DFS Traversal of Graph", sde:true, day:"Fri, Jun 5"},
    {id:"p3-5", title:"Number of Provinces (Connected Components)", sde:false, day:"Sat, Jun 6"},
    {id:"p3-6", title:"Number of Islands", sde:true, day:"Sat, Jun 6"},
    {id:"p3-7", title:"Flood Fill Algorithm", sde:true, day:"Sat, Jun 6"},
    {id:"p3-8", title:"Rotten Oranges (BFS)", sde:true, day:"Sat, Jun 6"},
    {id:"p3-9", title:"Detect Cycle in Undirected Graph (BFS)", sde:true, day:"Sat, Jun 6"},
    {id:"p3-10", title:"Detect Cycle in Undirected Graph (DFS)", sde:true, day:"Sat, Jun 6"},
    {id:"p3-11", title:"0/1 Matrix (Distance of Nearest Cell Having 1)", sde:false, day:"Sat, Jun 6"},
    {id:"p3-12", title:"Surrounded Regions (DFS/BFS)", sde:false, day:"Sat, Jun 6"},
    {id:"p3-13", title:"Number of Enclaves", sde:false, day:"Sat, Jun 6"},
    {id:"p3-14", title:"Word Ladder I", sde:false, day:"Sun, Jun 7"},
    {id:"p3-15", title:"Word Ladder II", sde:false, day:"Sun, Jun 7"},
    {id:"p3-16", title:"Number of Distinct Islands", sde:false, day:"Sun, Jun 7"},
    {id:"p3-17", title:"Bipartite Graph (BFS)", sde:true, day:"Sun, Jun 7"},
    {id:"p3-18", title:"Bipartite Graph (DFS)", sde:true, day:"Sun, Jun 7"},
    {id:"p3-19", title:"Topological Sort (DFS)", sde:true, day:"Sun, Jun 7"},
    {id:"p3-20", title:"Topological Sort (BFS — Kahn's Algorithm)", sde:true, day:"Sun, Jun 7"},
    {id:"p3-21", title:"Cycle Detection in Directed Graph (DFS)", sde:true, day:"Sun, Jun 7"},
    {id:"p3-22", title:"Course Schedule I", sde:false, day:"Sun, Jun 7"},
    {id:"p3-23", title:"Course Schedule II", sde:false, day:"Mon, Jun 8"},
    {id:"p3-24", title:"Alien Dictionary (Topo Sort)", sde:false, day:"Mon, Jun 8"},
    {id:"p3-25", title:"Find Eventual Safe States", sde:false, day:"Mon, Jun 8"},
    {id:"p3-26", title:"Shortest Path in Undirected Graph (Unit Weights)", sde:false, day:"Mon, Jun 8"},
    {id:"p3-27", title:"Shortest Path in DAG (Using Topo Sort)", sde:false, day:"Mon, Jun 8"},
    {id:"p3-28", title:"Dijkstra's Algorithm (Priority Queue / Set)", sde:true, day:"Tue, Jun 9"},
    {id:"p3-29", title:"Shortest Path in Binary Maze (BFS)", sde:false, day:"Tue, Jun 9"},
    {id:"p3-30", title:"Path with Minimum Effort", sde:false, day:"Tue, Jun 9"},
    {id:"p3-31", title:"Cheapest Flights Within K Stops", sde:false, day:"Tue, Jun 9"},
    {id:"p3-32", title:"Network Delay Time", sde:false, day:"Tue, Jun 9"},
    {id:"p3-33", title:"Number of Ways to Arrive at Destination", sde:false, day:"Wed, Jun 10"},
    {id:"p3-34", title:"Bellman-Ford Algorithm", sde:true, day:"Wed, Jun 10"},
    {id:"p3-35", title:"Floyd Warshall Algorithm", sde:true, day:"Wed, Jun 10"},
    {id:"p3-36", title:"City With Smallest Number of Neighbors", sde:false, day:"Wed, Jun 10"},
    {id:"p3-37", title:"Minimum Spanning Tree — Prim's Algorithm", sde:true, day:"Wed, Jun 10"},
    {id:"p3-38", title:"Minimum Spanning Tree — Kruskal's Algorithm", sde:true, day:"Thu, Jun 11"},
    {id:"p3-39", title:"Disjoint Set Union", sde:false, day:"Thu, Jun 11"},
    {id:"p3-40", title:"Number of Operations to Make Network Connected", sde:false, day:"Thu, Jun 11"},
    {id:"p3-41", title:"Most Stones Removed with Same Row/Col", sde:false, day:"Thu, Jun 11"},
    {id:"p3-42", title:"Accounts Merge", sde:false, day:"Thu, Jun 11"},
    {id:"p3-43", title:"Number of Islands II (Online Queries)", sde:false, day:"Fri, Jun 12"},
    {id:"p3-44", title:"Making a Large Island", sde:false, day:"Fri, Jun 12"},
    {id:"p3-45", title:"Bridges in Graph (Tarjan's)", sde:false, day:"Fri, Jun 12"},
    {id:"p3-46", title:"Articulation Points in Graph", sde:false, day:"Fri, Jun 12"},
    {id:"p3-47", title:"Kosaraju's Algorithm (SCC)", sde:true, day:"Fri, Jun 12"}
  ],
  "PHASE 4: TREES & STRINGS": [
    {id:"p4-1", title:"Binary Tree Representation in Code", sde:false, day:"Sat, Jun 13"},
    {id:"p4-2", title:"Preorder Traversal (Recursive)", sde:true, day:"Sat, Jun 13"},
    {id:"p4-3", title:"Inorder Traversal (Recursive)", sde:true, day:"Sat, Jun 13"},
    {id:"p4-4", title:"Postorder Traversal (Recursive)", sde:true, day:"Sat, Jun 13"},
    {id:"p4-5", title:"Level Order Traversal (BFS)", sde:true, day:"Sat, Jun 13"},
    {id:"p4-6", title:"Iterative Preorder Traversal", sde:true, day:"Sat, Jun 13"},
    {id:"p4-7", title:"Iterative Inorder Traversal", sde:true, day:"Sat, Jun 13"},
    {id:"p4-8", title:"Iterative Postorder (2 Stacks)", sde:true, day:"Sat, Jun 13"},
    {id:"p4-9", title:"Iterative Postorder (1 Stack)", sde:true, day:"Sat, Jun 13"},
    {id:"p4-10", title:"All Traversals in One", sde:true, day:"Sat, Jun 13"},
    {id:"p4-11", title:"Morris Inorder Traversal", sde:false, day:"Sun, Jun 14"},
    {id:"p4-12", title:"Morris Preorder Traversal", sde:false, day:"Sun, Jun 14"},
    {id:"p4-13", title:"Height / Maximum Depth of Binary Tree", sde:true, day:"Sun, Jun 14"},
    {id:"p4-14", title:"Check if Binary Tree is Balanced", sde:true, day:"Sun, Jun 14"},
    {id:"p4-15", title:"Diameter of Binary Tree", sde:true, day:"Sun, Jun 14"},
    {id:"p4-16", title:"Maximum Path Sum in Binary Tree", sde:true, day:"Sun, Jun 14"},
    {id:"p4-17", title:"Check if Two Trees are Identical", sde:true, day:"Sun, Jun 14"},
    {id:"p4-18", title:"Zig-Zag / Spiral Traversal", sde:true, day:"Sun, Jun 14"},
    {id:"p4-19", title:"Boundary Traversal of Binary Tree", sde:true, day:"Sun, Jun 14"},
    {id:"p4-20", title:"Vertical Order Traversal", sde:true, day:"Sun, Jun 14"},
    {id:"p4-21", title:"Top View of Binary Tree", sde:true, day:"Mon, Jun 15"},
    {id:"p4-22", title:"Bottom View of Binary Tree", sde:true, day:"Mon, Jun 15"},
    {id:"p4-23", title:"Right Side View of Binary Tree", sde:true, day:"Mon, Jun 15"},
    {id:"p4-24", title:"Left Side View of Binary Tree", sde:true, day:"Mon, Jun 15"},
    {id:"p4-25", title:"Check if Tree is Symmetric", sde:true, day:"Mon, Jun 15"},
    {id:"p4-26", title:"Root to Node Path in Binary Tree", sde:true, day:"Mon, Jun 15"},
    {id:"p4-27", title:"Lowest Common Ancestor (LCA)", sde:true, day:"Tue, Jun 16"},
    {id:"p4-28", title:"Maximum Width of Binary Tree", sde:true, day:"Tue, Jun 16"},
    {id:"p4-29", title:"Children Sum Property", sde:true, day:"Tue, Jun 16"},
    {id:"p4-30", title:"All Nodes at Distance K from Target", sde:true, day:"Tue, Jun 16"},
    {id:"p4-31", title:"Minimum Time to Burn Entire Binary Tree", sde:true, day:"Tue, Jun 16"},
    {id:"p4-32", title:"Count Total Nodes in Complete BT", sde:true, day:"Wed, Jun 17"},
    {id:"p4-33", title:"Requirements to Construct Unique BT", sde:false, day:"Wed, Jun 17"},
    {id:"p4-34", title:"Serialize and Deserialize Binary Tree", sde:true, day:"Wed, Jun 17"},
    {id:"p4-35", title:"Flatten Binary Tree to Linked List", sde:true, day:"Wed, Jun 17"},
    {id:"p4-36", title:"Construct BT from Preorder and Inorder", sde:true, day:"Wed, Jun 17"},
    {id:"p4-37", title:"Construct BT from Postorder and Inorder", sde:true, day:"Thu, Jun 18"},
    {id:"p4-38", title:"Search in BST", sde:true, day:"Thu, Jun 18"},
    {id:"p4-39", title:"Min Element in BST", sde:false, day:"Thu, Jun 18"},
    {id:"p4-40", title:"Max Element in BST", sde:false, day:"Thu, Jun 18"},
    {id:"p4-41", title:"Ceil in BST", sde:true, day:"Thu, Jun 18"},
    {id:"p4-42", title:"Floor in BST", sde:true, day:"Thu, Jun 18"},
    {id:"p4-43", title:"Insert a Node in BST", sde:false, day:"Fri, Jun 19"},
    {id:"p4-44", title:"Delete a Node in BST", sde:false, day:"Fri, Jun 19"},
    {id:"p4-45", title:"Kth Smallest Element in BST", sde:true, day:"Fri, Jun 19"},
    {id:"p4-46", title:"Kth Largest Element in BST", sde:true, day:"Fri, Jun 19"},
    {id:"p4-47", title:"Validate BST", sde:true, day:"Fri, Jun 19"},
    {id:"p4-48", title:"LCA in BST", sde:true, day:"Fri, Jun 19"},
    {id:"p4-49", title:"Construct BST from Preorder", sde:true, day:"Sat, Jun 20"},
    {id:"p4-50", title:"Populate Next Right Pointers", sde:true, day:"Sat, Jun 20"},
    {id:"p4-51", title:"Inorder Successor in BST", sde:true, day:"Sat, Jun 20"},
    {id:"p4-52", title:"Inorder Predecessor in BST", sde:true, day:"Sat, Jun 20"},
    {id:"p4-53", title:"BST Iterator", sde:true, day:"Sat, Jun 20"},
    {id:"p4-54", title:"Two Sum in BST", sde:true, day:"Sat, Jun 20"},
    {id:"p4-55", title:"Recover BST", sde:false, day:"Sat, Jun 20"},
    {id:"p4-56", title:"Largest BST in Binary Tree", sde:true, day:"Sat, Jun 20"},
    {id:"p4-57", title:"Merge Two BSTs", sde:false, day:"Sat, Jun 20"},
    {id:"p4-58", title:"Min Characters to Make String Palindrome", sde:true, day:"Sat, Jun 20"},
    {id:"p4-59", title:"Check for Anagrams", sde:true, day:"Sat, Jun 20"},
    {id:"p4-60", title:"Count and Say", sde:true, day:"Sun, Jun 21"},
    {id:"p4-61", title:"Compare Version Numbers", sde:true, day:"Sun, Jun 21"},
    {id:"p4-62", title:"KMP Algorithm / LPS Array", sde:true, day:"Sun, Jun 21"},
    {id:"p4-63", title:"Z-Algorithm for Pattern Matching", sde:true, day:"Sun, Jun 21"},
    {id:"p4-64", title:"Rabin-Karp Algorithm", sde:true, day:"Sun, Jun 21"},
    {id:"p4-65", title:"Implement Stack using Arrays", sde:true, day:"Sun, Jun 21"},
    {id:"p4-66", title:"Implement Queue using Arrays", sde:true, day:"Sun, Jun 21"},
    {id:"p4-67", title:"Implement Stack using Queue", sde:true, day:"Sun, Jun 21"},
    {id:"p4-68", title:"Implement Queue using Stack", sde:true, day:"Sun, Jun 21"},
    {id:"p4-69", title:"Implement Stack using Linked List", sde:false, day:"Sun, Jun 21"}
  ],
  "PHASE 5: STACK & QUEUE": [
    {id:"p5-1", title:"Implement Queue using Linked List", sde:false, day:"Mon, Jun 22"},
    {id:"p5-2", title:"Check for Balanced Parentheses", sde:true, day:"Mon, Jun 22"},
    {id:"p5-3", title:"Implement Min Stack", sde:true, day:"Mon, Jun 22"},
    {id:"p5-4", title:"Infix to Postfix Conversion", sde:false, day:"Mon, Jun 22"},
    {id:"p5-5", title:"Infix to Prefix Conversion", sde:false, day:"Mon, Jun 22"},
    {id:"p5-6", title:"Prefix to Infix Conversion", sde:false, day:"Tue, Jun 23"},
    {id:"p5-7", title:"Prefix to Postfix Conversion", sde:false, day:"Tue, Jun 23"},
    {id:"p5-8", title:"Postfix to Prefix Conversion", sde:false, day:"Tue, Jun 23"},
    {id:"p5-9", title:"Postfix to Infix Conversion", sde:false, day:"Tue, Jun 23"},
    {id:"p5-10", title:"Next Greater Element I", sde:true, day:"Tue, Jun 23"},
    {id:"p5-11", title:"Next Greater Element II (Circular)", sde:false, day:"Wed, Jun 24"},
    {id:"p5-12", title:"Next Smaller Element", sde:true, day:"Wed, Jun 24"},
    {id:"p5-13", title:"Number of NGEs to the Right", sde:false, day:"Wed, Jun 24"},
    {id:"p5-14", title:"Trapping Rain Water", sde:true, day:"Wed, Jun 24"},
    {id:"p5-15", title:"Sum of Subarray Minimums", sde:false, day:"Wed, Jun 24"},
    {id:"p5-16", title:"Stock Span Problem", sde:true, day:"Thu, Jun 25"},
    {id:"p5-17", title:"Asteroid Collision", sde:false, day:"Thu, Jun 25"},
    {id:"p5-18", title:"Sum of Subarray Ranges", sde:false, day:"Thu, Jun 25"},
    {id:"p5-19", title:"Remove K Digits", sde:false, day:"Thu, Jun 25"},
    {id:"p5-20", title:"Largest Rectangle in Histogram", sde:true, day:"Thu, Jun 25"},
    {id:"p5-21", title:"Maximal Rectangle (Stack approach)", sde:true, day:"Fri, Jun 26"},
    {id:"p5-22", title:"Sliding Window Maximum (Deque)", sde:true, day:"Fri, Jun 26"},
    {id:"p5-23", title:"Celebrity Problem", sde:true, day:"Fri, Jun 26"},
    {id:"p5-24", title:"LRU Cache", sde:true, day:"Fri, Jun 26"},
    {id:"p5-25", title:"LFU Cache", sde:true, day:"Fri, Jun 26"}
  ],
  "PHASE 6: HEAPS & RECURSION": [
    {id:"p6-1", title:"Online Stock Span", sde:true, day:"Sat, Jun 27"},
    {id:"p6-2", title:"Check if Array is a Heap", sde:false, day:"Sat, Jun 27"},
    {id:"p6-3", title:"Implement Binary Heap", sde:true, day:"Sat, Jun 27"},
    {id:"p6-4", title:"Convert Min Heap to Max Heap", sde:false, day:"Sat, Jun 27"},
    {id:"p6-5", title:"Kth Largest Element in Array", sde:true, day:"Sat, Jun 27"},
    {id:"p6-6", title:"Kth Smallest Element in Array", sde:false, day:"Sat, Jun 27"},
    {id:"p6-7", title:"Sort K Nearly Sorted Array", sde:false, day:"Sat, Jun 27"},
    {id:"p6-8", title:"Merge K Sorted Arrays / Lists", sde:true, day:"Sat, Jun 27"},
    {id:"p6-9", title:"Replace Elements by Rank", sde:false, day:"Sat, Jun 27"},
    {id:"p6-10", title:"Hand of Straights", sde:false, day:"Sat, Jun 27"},
    {id:"p6-11", title:"Top K Frequent Elements", sde:true, day:"Sun, Jun 28"},
    {id:"p6-12", title:"Find Median from Data Stream", sde:true, day:"Sun, Jun 28"},
    {id:"p6-13", title:"Task Scheduler", sde:false, day:"Sun, Jun 28"},
    {id:"p6-14", title:"Kth Largest Element in Stream", sde:false, day:"Sun, Jun 28"},
    {id:"p6-15", title:"Maximum Sum Combinations", sde:true, day:"Sun, Jun 28"},
    {id:"p6-16", title:"Minimum Cost to Connect Sticks", sde:false, day:"Sun, Jun 28"},
    {id:"p6-17", title:"Design Twitter", sde:false, day:"Sun, Jun 28"},
    {id:"p6-18", title:"Power(x, n)", sde:true, day:"Sun, Jun 28"},
    {id:"p6-19", title:"Count Good Numbers", sde:false, day:"Sun, Jun 28"},
    {id:"p6-20", title:"Recursive Implement Atoi", sde:false, day:"Sun, Jun 28"},
    {id:"p6-21", title:"Reverse Stack using Recursion", sde:false, day:"Mon, Jun 29"},
    {id:"p6-22", title:"Sort Stack using Recursion", sde:true, day:"Mon, Jun 29"},
    {id:"p6-23", title:"Generate Binary Strings", sde:false, day:"Mon, Jun 29"},
    {id:"p6-24", title:"Generate Parentheses", sde:false, day:"Mon, Jun 29"},
    {id:"p6-25", title:"Letter Combinations of Phone Number", sde:false, day:"Mon, Jun 29"},
    {id:"p6-26", title:"Generate All Subsequences / Power Set", sde:false, day:"Tue, Jun 30"},
    {id:"p6-27", title:"Print All Subsequences with Sum K", sde:false, day:"Tue, Jun 30"},
    {id:"p6-28", title:"Count Subsequences with Sum K", sde:false, day:"Tue, Jun 30"},
    {id:"p6-29", title:"Combination Sum I", sde:true, day:"Tue, Jun 30"},
    {id:"p6-30", title:"Combination Sum II", sde:true, day:"Tue, Jun 30"},
    {id:"p6-31", title:"Combination Sum III", sde:false, day:"Wed, Jul 1"},
    {id:"p6-32", title:"Kth Permutation Sequence", sde:true, day:"Wed, Jul 1"},
    {id:"p6-33", title:"Subset Sum I", sde:true, day:"Wed, Jul 1"},
    {id:"p6-34", title:"Subset Sum II", sde:true, day:"Wed, Jul 1"},
    {id:"p6-35", title:"Permutations (Approach 1)", sde:true, day:"Wed, Jul 1"},
    {id:"p6-36", title:"Permutations (Approach 2 — swap)", sde:true, day:"Thu, Jul 2"},
    {id:"p6-37", title:"N-Queens Problem", sde:true, day:"Thu, Jul 2"},
    {id:"p6-38", title:"Sudoku Solver", sde:true, day:"Thu, Jul 2"},
    {id:"p6-39", title:"M-Coloring Problem", sde:true, day:"Thu, Jul 2"},
    {id:"p6-40", title:"Palindrome Partitioning", sde:true, day:"Thu, Jul 2"}
  ],
  "PHASE 7: BACKTRACKING & LL": [
    {id:"p7-1", title:"Rat in a Maze", sde:true, day:"Fri, Jul 3"},
    {id:"p7-2", title:"Word Break", sde:true, day:"Fri, Jul 3"},
    {id:"p7-3", title:"Word Search", sde:false, day:"Fri, Jul 3"},
    {id:"p7-4", title:"Introduction to Linked List", sde:false, day:"Fri, Jul 3"},
    {id:"p7-5", title:"Inserting a Node in LL", sde:false, day:"Fri, Jul 3"},
    {id:"p7-6", title:"Deleting a Node in LL", sde:false, day:"Sat, Jul 4"},
    {id:"p7-7", title:"Delete Given Node in O(1)", sde:true, day:"Sat, Jul 4"},
    {id:"p7-8", title:"Find Length of Linked List", sde:false, day:"Sat, Jul 4"},
    {id:"p7-9", title:"Search in Linked List", sde:false, day:"Sat, Jul 4"},
    {id:"p7-10", title:"Introduction to Doubly Linked List", sde:false, day:"Sat, Jul 4"},
    {id:"p7-11", title:"Insert a Node in DLL", sde:false, day:"Sat, Jul 4"},
    {id:"p7-12", title:"Delete a Node in DLL", sde:false, day:"Sat, Jul 4"},
    {id:"p7-13", title:"Delete All Occurrences of Target in DLL", sde:false, day:"Sat, Jul 4"},
    {id:"p7-14", title:"Find Pairs with Given Sum in DLL", sde:false, day:"Sat, Jul 4"},
    {id:"p7-15", title:"Remove Duplicates from Sorted DLL", sde:false, day:"Sat, Jul 4"},
    {id:"p7-16", title:"Reverse a Linked List — Iterative", sde:true, day:"Sat, Jul 4"},
    {id:"p7-17", title:"Reverse a Linked List — Recursive", sde:true, day:"Sat, Jul 4"},
    {id:"p7-18", title:"Find Middle of Linked List", sde:true, day:"Sun, Jul 5"},
    {id:"p7-19", title:"Detect a Cycle in Linked List", sde:true, day:"Sun, Jul 5"},
    {id:"p7-20", title:"Find Starting Point of Cycle", sde:true, day:"Sun, Jul 5"},
    {id:"p7-21", title:"Length of Loop in Linked List", sde:false, day:"Sun, Jul 5"},
    {id:"p7-22", title:"Check if Linked List is Palindrome", sde:true, day:"Sun, Jul 5"},
    {id:"p7-23", title:"Segregate Odd and Even Nodes", sde:false, day:"Sun, Jul 5"},
    {id:"p7-24", title:"Remove Nth Node from End", sde:true, day:"Sun, Jul 5"},
    {id:"p7-25", title:"Delete the Middle Node", sde:false, day:"Sun, Jul 5"},
    {id:"p7-26", title:"Sort a Linked List (Merge Sort)", sde:false, day:"Sun, Jul 5"},
    {id:"p7-27", title:"Sort Linked List of 0s, 1s, and 2s", sde:false, day:"Sun, Jul 5"},
    {id:"p7-28", title:"Intersection of Two Linked Lists", sde:true, day:"Mon, Jul 6"},
    {id:"p7-29", title:"Add 1 to a Linked List Number", sde:false, day:"Mon, Jul 6"},
    {id:"p7-30", title:"Add Two Numbers (as Linked Lists)", sde:true, day:"Mon, Jul 6"},
    {id:"p7-31", title:"Merge Two Sorted Linked Lists", sde:true, day:"Mon, Jul 6"},
    {id:"p7-32", title:"Reverse Nodes in K-Group", sde:true, day:"Mon, Jul 6"},
    {id:"p7-33", title:"Rotate a Linked List", sde:true, day:"Tue, Jul 7"},
    {id:"p7-34", title:"Flatten a Linked List", sde:true, day:"Tue, Jul 7"},
    {id:"p7-35", title:"Clone a Linked List with Random Pointer", sde:true, day:"Tue, Jul 7"},
    {id:"p7-36", title:"Design Browser History (DLL)", sde:false, day:"Tue, Jul 7"},
    {id:"p7-37", title:"Merge K Sorted Lists", sde:false, day:"Tue, Jul 7"}
  ],
  "PHASE 8: GREEDY & ARRAYS": [
    {id:"p8-1", title:"Assign Cookies", sde:false, day:"Wed, Jul 8"},
    {id:"p8-2", title:"Lemonade Change", sde:false, day:"Wed, Jul 8"},
    {id:"p8-3", title:"Fractional Knapsack", sde:true, day:"Wed, Jul 8"},
    {id:"p8-4", title:"Minimum Number of Coins (Greedy)", sde:true, day:"Wed, Jul 8"},
    {id:"p8-5", title:"Valid Parenthesis String", sde:false, day:"Wed, Jul 8"},
    {id:"p8-6", title:"N Meetings in One Room", sde:true, day:"Thu, Jul 9"},
    {id:"p8-7", title:"Job Sequencing Problem", sde:true, day:"Thu, Jul 9"},
    {id:"p8-8", title:"Minimum Platforms", sde:true, day:"Thu, Jul 9"},
    {id:"p8-9", title:"Jump Game I", sde:false, day:"Thu, Jul 9"},
    {id:"p8-10", title:"Jump Game II", sde:false, day:"Thu, Jul 9"},
    {id:"p8-11", title:"Activity Selection", sde:true, day:"Fri, Jul 10"},
    {id:"p8-12", title:"Non-overlapping Intervals", sde:false, day:"Fri, Jul 10"},
    {id:"p8-13", title:"Insert Interval", sde:false, day:"Fri, Jul 10"},
    {id:"p8-14", title:"Merge Intervals (Greedy)", sde:false, day:"Fri, Jul 10"},
    {id:"p8-15", title:"Candy Distribution", sde:false, day:"Fri, Jul 10"},
    {id:"p8-16", title:"Shortest Job First", sde:false, day:"Fri, Jul 10"},
    {id:"p8-17", title:"Largest Element in Array", sde:false, day:"Fri, Jul 10"},
    {id:"p8-18", title:"Second Largest Element", sde:false, day:"Sat, Jul 11"},
    {id:"p8-19", title:"Check if Array is Sorted", sde:false, day:"Sat, Jul 11"},
    {id:"p8-20", title:"Remove Duplicates from Sorted Array", sde:true, day:"Sat, Jul 11"},
    {id:"p8-21", title:"Left Rotate Array by One Place", sde:false, day:"Sat, Jul 11"},
    {id:"p8-22", title:"Left Rotate Array by K Places", sde:false, day:"Sat, Jul 11"},
    {id:"p8-23", title:"Move Zeros to End", sde:false, day:"Sat, Jul 11"},
    {id:"p8-24", title:"Linear Search", sde:false, day:"Sat, Jul 11"},
    {id:"p8-25", title:"Find Union of Two Sorted Arrays", sde:false, day:"Sat, Jul 11"},
    {id:"p8-26", title:"Find Intersection of Two Sorted Arrays", sde:false, day:"Sat, Jul 11"},
    {id:"p8-27", title:"Find Missing Number in Array", sde:false, day:"Sat, Jul 11"},
    {id:"p8-28", title:"Maximum Consecutive Ones", sde:true, day:"Sat, Jul 11"},
    {id:"p8-29", title:"Find Number that Appears Once (XOR)", sde:false, day:"Sat, Jul 11"},
    {id:"p8-30", title:"Longest Subarray with Sum K", sde:false, day:"Sun, Jul 12"},
    {id:"p8-31", title:"Two Sum Problem", sde:true, day:"Sun, Jul 12"},
    {id:"p8-32", title:"Sort Array of 0s, 1s, and 2s", sde:true, day:"Sun, Jul 12"},
    {id:"p8-33", title:"Majority Element (> n/2)", sde:true, day:"Sun, Jul 12"},
    {id:"p8-34", title:"Maximum Subarray Sum — Kadane's", sde:true, day:"Sun, Jul 12"},
    {id:"p8-35", title:"Best Time to Buy and Sell Stock", sde:true, day:"Sun, Jul 12"},
    {id:"p8-36", title:"Rearrange Array Elements by Sign", sde:false, day:"Sun, Jul 12"},
    {id:"p8-37", title:"Next Permutation", sde:true, day:"Sun, Jul 12"},
    {id:"p8-38", title:"Leaders in an Array", sde:false, day:"Sun, Jul 12"},
    {id:"p8-39", title:"Longest Consecutive Sequence", sde:true, day:"Sun, Jul 12"}
  ],
  "PHASE 9: ARRAYS (Finish)": [
    {id:"p9-1", title:"Set Matrix Zeroes", sde:true, day:"Mon, Jul 13"},
    {id:"p9-2", title:"Rotate Matrix by 90 Degrees", sde:true, day:"Mon, Jul 13"},
    {id:"p9-3", title:"Spiral Traversal of Matrix", sde:false, day:"Mon, Jul 13"},
    {id:"p9-4", title:"Count Subarrays with Given Sum", sde:false, day:"Mon, Jul 13"},
    {id:"p9-5", title:"Pascal's Triangle", sde:true, day:"Mon, Jul 13"},
    {id:"p9-6", title:"Majority Element II (> n/3)", sde:true, day:"Tue, Jul 14"},
    {id:"p9-7", title:"3-Sum Problem", sde:true, day:"Tue, Jul 14"},
    {id:"p9-8", title:"4-Sum Problem", sde:true, day:"Tue, Jul 14"},
    {id:"p9-9", title:"Merge Overlapping Intervals", sde:true, day:"Tue, Jul 14"},
    {id:"p9-10", title:"Merge Two Sorted Arrays No Extra Space", sde:true, day:"Tue, Jul 14"},
    {id:"p9-11", title:"Find Repeating and Missing Number", sde:true, day:"Wed, Jul 15"},
    {id:"p9-12", title:"Find the Duplicate Number", sde:true, day:"Wed, Jul 15"},
    {id:"p9-13", title:"Count Inversions (Merge Sort)", sde:true, day:"Wed, Jul 15"},
    {id:"p9-14", title:"Reverse Pairs (Merge Sort)", sde:true, day:"Wed, Jul 15"},
    {id:"p9-15", title:"Maximum Product Subarray", sde:true, day:"Wed, Jul 15"},
    {id:"p9-16", title:"Count Subarrays with XOR K", sde:true, day:"Thu, Jul 16"},
    {id:"p9-17", title:"Largest Subarray with Sum 0", sde:true, day:"Thu, Jul 16"},
    {id:"p9-18", title:"Frequency of Most Frequent Element", sde:false, day:"Thu, Jul 16"},
    {id:"p9-19", title:"Binary Search Algorithm — Iterative", sde:false, day:"Thu, Jul 16"},
    {id:"p9-20", title:"Binary Search Algorithm — Recursive", sde:false, day:"Thu, Jul 16"},
    {id:"p9-21", title:"Lower Bound", sde:false, day:"Thu, Jul 16"},
    {id:"p9-22", title:"Upper Bound", sde:false, day:"Thu, Jul 16"}
  ],
  "PHASE 10: BINARY SEARCH": [
    {id:"p10-1", title:"Search Insert Position", sde:false, day:"Fri, Jul 17"},
    {id:"p10-2", title:"Floor in Sorted Array", sde:false, day:"Fri, Jul 17"},
    {id:"p10-3", title:"Ceil in Sorted Array", sde:false, day:"Fri, Jul 17"},
    {id:"p10-4", title:"Find First and Last Occurrence", sde:false, day:"Fri, Jul 17"},
    {id:"p10-5", title:"Count Occurrences in Sorted Array", sde:false, day:"Fri, Jul 17"},
    {id:"p10-6", title:"Search in Rotated Sorted Array I", sde:true, day:"Fri, Jul 17"},
    {id:"p10-7", title:"Search in Rotated Sorted Array II", sde:false, day:"Sat, Jul 18"},
    {id:"p10-8", title:"Find Minimum in Rotated Sorted Array", sde:true, day:"Sat, Jul 18"},
    {id:"p10-9", title:"How Many Times Array is Rotated", sde:false, day:"Sat, Jul 18"},
    {id:"p10-10", title:"Single Element in Sorted Array", sde:true, day:"Sat, Jul 18"},
    {id:"p10-11", title:"Find Peak Element", sde:false, day:"Sat, Jul 18"},
    {id:"p10-12", title:"Sqrt of a Number", sde:true, day:"Sat, Jul 18"},
    {id:"p10-13", title:"Nth Root of a Number", sde:true, day:"Sat, Jul 18"},
    {id:"p10-14", title:"Koko Eating Bananas", sde:false, day:"Sat, Jul 18"},
    {id:"p10-15", title:"Minimum Days to Make M Bouquets", sde:false, day:"Sat, Jul 18"},
    {id:"p10-16", title:"Smallest Divisor Given a Threshold", sde:false, day:"Sat, Jul 18"},
    {id:"p10-17", title:"Capacity to Ship Packages in D Days", sde:false, day:"Sun, Jul 19"},
    {id:"p10-18", title:"Aggressive Cows / Magnetic Balls", sde:true, day:"Sun, Jul 19"},
    {id:"p10-19", title:"Book Allocation / Split Array Largest Sum", sde:true, day:"Sun, Jul 19"},
    {id:"p10-20", title:"Painter's Partition", sde:false, day:"Sun, Jul 19"},
    {id:"p10-21", title:"Kth Missing Positive Number", sde:false, day:"Sun, Jul 19"},
    {id:"p10-22", title:"Minimize Max Distance to Gas Station", sde:false, day:"Sun, Jul 19"},
    {id:"p10-23", title:"Find Row with Maximum 1s", sde:false, day:"Sun, Jul 19"},
    {id:"p10-24", title:"Search in 2D Matrix I", sde:true, day:"Sun, Jul 19"},
    {id:"p10-25", title:"Search in 2D Matrix II", sde:false, day:"Sun, Jul 19"},
    {id:"p10-26", title:"Find Peak Element in 2D Matrix", sde:false, day:"Sun, Jul 19"}
  ],
  "PHASE 11: STRINGS, BITS & SW": [
    {id:"p11-1", title:"Median of Row-wise Sorted Matrix", sde:true, day:"Mon, Jul 20"},
    {id:"p11-2", title:"Median of Two Sorted Arrays", sde:true, day:"Mon, Jul 20"},
    {id:"p11-3", title:"Kth Element of Two Sorted Arrays", sde:true, day:"Mon, Jul 20"},
    {id:"p11-4", title:"Remove Outermost Parentheses", sde:false, day:"Mon, Jul 20"},
    {id:"p11-5", title:"Reverse Words in a String", sde:true, day:"Mon, Jul 20"},
    {id:"p11-6", title:"Largest Odd Number in String", sde:false, day:"Tue, Jul 21"},
    {id:"p11-7", title:"Longest Common Prefix", sde:true, day:"Tue, Jul 21"},
    {id:"p11-8", title:"Isomorphic Strings", sde:false, day:"Tue, Jul 21"},
    {id:"p11-9", title:"Check if Strings are Rotations of Each Other", sde:false, day:"Tue, Jul 21"},
    {id:"p11-10", title:"Sort Characters by Frequency", sde:false, day:"Tue, Jul 21"},
    {id:"p11-11", title:"Maximum Nesting Depth of Parentheses", sde:false, day:"Tue, Jul 21"},
    {id:"p11-12", title:"Roman to Integer", sde:true, day:"Wed, Jul 22"},
    {id:"p11-13", title:"Integer to Roman", sde:true, day:"Wed, Jul 22"},
    {id:"p11-14", title:"Atoi — String to Integer", sde:true, day:"Wed, Jul 22"},
    {id:"p11-15", title:"Longest Palindromic Substring", sde:true, day:"Wed, Jul 22"},
    {id:"p11-16", title:"Sum of Beauty of All Substrings", sde:false, day:"Wed, Jul 22"},
    {id:"p11-17", title:"Check Odd/Even using Bits", sde:false, day:"Thu, Jul 23"},
    {id:"p11-18", title:"Swap Two Numbers using XOR", sde:false, day:"Thu, Jul 23"},
    {id:"p11-19", title:"Binary to Decimal", sde:false, day:"Thu, Jul 23"},
    {id:"p11-20", title:"Decimal to Binary", sde:false, day:"Thu, Jul 23"},
    {id:"p11-21", title:"Check ith Bit (is set)", sde:false, day:"Thu, Jul 23"},
    {id:"p11-22", title:"Set ith Bit", sde:false, day:"Thu, Jul 23"},
    {id:"p11-23", title:"Toggle ith Bit", sde:false, day:"Thu, Jul 23"},
    {id:"p11-24", title:"Flip First Set Bit", sde:false, day:"Thu, Jul 23"},
    {id:"p11-25", title:"Check if Number is Power of 2", sde:false, day:"Thu, Jul 23"},
    {id:"p11-26", title:"Count Set Bits / Brian Kernighan's", sde:true, day:"Fri, Jul 24"},
    {id:"p11-27", title:"Minimum Bit Flips to Convert Number", sde:false, day:"Fri, Jul 24"},
    {id:"p11-28", title:"Power Set using Bits", sde:true, day:"Fri, Jul 24"},
    {id:"p11-29", title:"Single Number I (XOR)", sde:true, day:"Fri, Jul 24"},
    {id:"p11-30", title:"Single Number II", sde:false, day:"Fri, Jul 24"},
    {id:"p11-31", title:"Single Number III", sde:false, day:"Fri, Jul 24"},
    {id:"p11-32", title:"XOR of Numbers in a Range [L, R]", sde:false, day:"Sat, Jul 25"},
    {id:"p11-33", title:"Divide Two Integers (Bit Manipulation)", sde:true, day:"Sat, Jul 25"},
    {id:"p11-34", title:"Find MSB / Most Significant Set Bit", sde:true, day:"Sat, Jul 25"},
    {id:"p11-35", title:"All Factors / Divisors of a Number", sde:false, day:"Sat, Jul 25"},
    {id:"p11-36", title:"Sieve of Eratosthenes", sde:false, day:"Sat, Jul 25"},
    {id:"p11-37", title:"Prime Factorization of a Number", sde:true, day:"Sat, Jul 25"},
    {id:"p11-38", title:"Prime Factorization using Sieve", sde:false, day:"Sat, Jul 25"},
    {id:"p11-39", title:"Longest Subarray with Sum ≤ K", sde:false, day:"Sat, Jul 25"},
    {id:"p11-40", title:"Longest Substring Without Repeating", sde:true, day:"Sat, Jul 25"},
    {id:"p11-41", title:"Max Consecutive Ones III", sde:false, day:"Sat, Jul 25"},
    {id:"p11-42", title:"Fruit Into Baskets", sde:false, day:"Sat, Jul 25"},
    {id:"p11-43", title:"Longest Substring with At Most K Distinct", sde:false, day:"Sat, Jul 25"},
    {id:"p11-44", title:"Number of Substrings Containing All Three", sde:false, day:"Sat, Jul 25"},
    {id:"p11-45", title:"Count Number of Nice Subarrays", sde:false, day:"Sun, Jul 26"},
    {id:"p11-46", title:"Binary Subarrays with Sum", sde:false, day:"Sun, Jul 26"},
    {id:"p11-47", title:"Longest Repeating Character Replacement", sde:false, day:"Sun, Jul 26"},
    {id:"p11-48", title:"Minimum Window Substring", sde:false, day:"Sun, Jul 26"},
    {id:"p11-49", title:"Minimum Window Subsequence", sde:false, day:"Sun, Jul 26"},
    {id:"p11-50", title:"Subarrays with K Different Integers", sde:false, day:"Sun, Jul 26"},
    {id:"p11-51", title:"Max Points on a Line", sde:false, day:"Sun, Jul 26"},
    {id:"p11-52", title:"Sorting Review — Selection Sort", sde:false, day:"Sun, Jul 26"},
    {id:"p11-53", title:"Sorting Review — Bubble Sort", sde:false, day:"Sun, Jul 26"},
    {id:"p11-54", title:"Sorting Review — Insertion Sort", sde:false, day:"Sun, Jul 26"},
    {id:"p11-55", title:"Sorting Review — Merge Sort", sde:false, day:"Sun, Jul 26"},
    {id:"p11-56", title:"Sorting Review — Quick Sort", sde:false, day:"Sun, Jul 26"}
  ]
};

export default function Tracker() {
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [updatedAt, setUpdatedAt] = useState<Record<string, string>>({});
  const [reviewCount, setReviewCount] = useState<Record<string, number>>({});
  const [view, setView] = useState<'phase' | 'day' | 'revision' | 'completed'>('day');
  const [activePhase, setActivePhase] = useState('PHASE 3: GRAPHS');
  const [activeDayKey, setActiveDayKey] = useState(() => {
    const n = new Date();
    const DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${DN[n.getDay()]}, ${MN[n.getMonth()]} ${n.getDate()}`;
  });

  useEffect(() => {
    fetch('/api/progress')
      .then(r => r.json())
      .then(data => {
        if (data.status) {
          setProgress(data.status);
          setUpdatedAt(data.updatedAt || {});
          setReviewCount(data.reviewCount || {});
        } else {
          setProgress(data);
        }
      })
      .catch(() => {});
  }, []);

  const toggle = async (id: string, target: string) => {
    const cur = progress[id] || 'unsolved';
    const next = cur === target ? 'unsolved' : target;
    setProgress(p => ({ ...p, [id]: next }));
    // Keep updatedAt in sync so revisionDueForDay can schedule this problem correctly.
    // Without this, problems marked in the current session never appear in the revision queue.
    if (next !== 'unsolved') {
      setUpdatedAt(u => ({ ...u, [id]: new Date().toISOString() }));
      setReviewCount(rc => ({ ...rc, [id]: 0 })); // reset SR stage on re-solve
    }
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId: id, status: next, reviewCount: 0 }),
    });
  };

  const allProblems = useMemo(() => Object.values(dataset).flat() as Problem[], []);
  const total = allProblems.length;
  const solved = useMemo(() => allProblems.filter(p => progress[p.id] === 'solved').length, [allProblems, progress]);
  const hinted = useMemo(() => allProblems.filter(p => progress[p.id] === 'hint').length, [allProblems, progress]);
  const toRevise = useMemo(() => allProblems.filter(p => progress[p.id] === 'revisit').length, [allProblems, progress]);

  const problemsByDay = useMemo(() => {
    const map: Record<string, Problem[]> = {};
    for (const p of allProblems) {
      if (!map[p.day]) map[p.day] = [];
      map[p.day].push(p);
    }
    return map;
  }, [allProblems]);

  const revisionByPhase = useMemo(() => {
    const map: Record<string, Problem[]> = {};
    for (const [ph, probs] of Object.entries(dataset)) {
      const r = (probs as Problem[]).filter(p => progress[p.id] === 'revisit');
      if (r.length > 0) map[ph] = r;
    }
    return map;
  }, [progress]);

  const completedByPhase = useMemo(() => {
    const map: Record<string, Problem[]> = {};
    for (const [ph, probs] of Object.entries(dataset)) {
      const c = (probs as Problem[]).filter(p => progress[p.id] === 'solved' || progress[p.id] === 'hint');
      if (c.length > 0) map[ph] = c;
    }
    return map;
  }, [progress]);

  // ── Calendar helpers ──────────────────────────────────────────────────
  const MONTH_IDX: Record<string, number> = { Apr: 3, May: 4, Jun: 5, Jul: 6 };
  const _now = new Date();
  const TODAY_DATE = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate());
  const STUDY_START = new Date(2026, 3, 27);
  const STUDY_END   = new Date(2026, 6, 26);

  function parseDayKey(key: string): Date | null {
    const m = key.match(/\w+, (\w+) (\d+)/);
    if (!m || !(m[1] in MONTH_IDX)) return null;
    return new Date(2026, MONTH_IDX[m[1]], +m[2]);
  }

  function dayStatus(dayKey: string): string {
    const date = parseDayKey(dayKey);
    const probs = problemsByDay[dayKey] || [];
    if (!date || probs.length === 0) return 'empty';
    const done = probs.filter(p => progress[p.id] === 'solved' || progress[p.id] === 'hint').length;
    const isToday = date.getTime() === TODAY_DATE.getTime();
    const isPast  = date < TODAY_DATE;
    if (isToday) return done === probs.length ? 'todayDone' : 'today';
    if (!isPast)  return 'future';
    if (done === probs.length) return 'done';
    if (done > 0) return 'partial';
    return 'overdue';
  }

  function buildDayKey(month: number, day: number): string {
    const d = new Date(2026, month, day);
    const DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${DN[d.getDay()]}, ${MN[d.getMonth()]} ${day}`;
  }

  function buildMonthGrid(month: number, days: number): (number | null)[] {
    const offset = (new Date(2026, month, 1).getDay() + 6) % 7;
    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  function isInStudyRange(month: number, day: number) {
    const d = new Date(2026, month, day);
    return d >= STUDY_START && d <= STUDY_END;
  }

  const calMonths = [
    { name: 'April 2026',  month: 3, days: 30 },
    { name: 'May 2026',    month: 4, days: 31 },
    { name: 'June 2026',   month: 5, days: 30 },
    { name: 'July 2026',   month: 6, days: 26 },
  ];

  const cellStyle: Record<string, string> = {
    overdue:  'bg-rose-950/70 border border-rose-600/60 text-rose-300',
    today:    'bg-blue-950/60 ring-2 ring-blue-400 text-blue-200',
    todayDone:'bg-emerald-950/50 ring-2 ring-emerald-400 text-emerald-300',
    future:   'bg-slate-800/30 border border-slate-700/20 text-slate-500',
    done:     'bg-emerald-950/50 border border-emerald-700/40 text-emerald-400',
    partial:  'bg-amber-950/50 border border-amber-600/40 text-amber-400',
    empty:    'text-slate-700 cursor-default',
  };

  // ── Spaced Repetition helpers ─────────────────────────────────────────

  // Map problem id → short phase label (e.g. "DYNAMIC PROGRAMMING")
  const problemPhase = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [ph, probs] of Object.entries(dataset)) {
      const short = ph.split(':')[1]?.trim() ?? ph;
      for (const p of probs as Problem[]) map[p.id] = short;
    }
    return map;
  }, []);

  // Returns problems due for review on dayKey.
  // Logic: daysAgo >= SR_STAGES[review_count].nextInterval → due.
  // After "Recalled ✓", review_count++ so the problem won't show again until the NEXT interval.
  // Missed reviews persist (still show next day, next week) until recalled — never silently drop.
  function revisionDueForDay(dayKey: string): Array<{ problem: Problem; stage: number; daysAgo: number; overdue: boolean }> {
    const date = parseDayKey(dayKey);
    if (!date) return [];
    const result: Array<{ problem: Problem; stage: number; daysAgo: number; overdue: boolean }> = [];
    for (const p of allProblems) {
      const s  = progress[p.id];
      const ua = updatedAt[p.id];
      const stage = reviewCount[p.id] ?? 0;
      if (!ua || (s !== 'solved' && s !== 'hint')) continue;
      if (stage >= SR_STAGES.length) continue; // fully learned
      const d    = new Date(ua);
      const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const daysAgo = Math.round((date.getTime() - dOnly.getTime()) / (1000 * 60 * 60 * 24));
      const nextInterval = SR_STAGES[stage].nextInterval;
      if (daysAgo >= nextInterval) {
        // Overdue = 30+ days past the scheduled interval (severely missed)
        const overdue = (daysAgo - nextInterval) >= 30 && date >= TODAY_DATE;
        result.push({ problem: p, stage, daysAgo, overdue });
      }
    }
    result.sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      if (a.stage  !== b.stage)   return a.stage - b.stage;
      if (a.problem.sde !== b.problem.sde) return a.problem.sde ? -1 : 1;
      return b.daysAgo - a.daysAgo;
    });
    return result;
  }

  // Increments review_count (advances SR stage) and stamps selected calendar date.
  const markReviewed = async (id: string) => {
    const s = progress[id];
    if (!s || s === 'unsolved') return;
    const recallDate = parseDayKey(activeDayKey) ?? new Date();
    const isoDate = new Date(recallDate.getFullYear(), recallDate.getMonth(), recallDate.getDate(), 12).toISOString();
    const nextStage = Math.min((reviewCount[id] ?? 0) + 1, SR_STAGES.length);
    setUpdatedAt(u => ({ ...u, [id]: isoDate }));
    setReviewCount(rc => ({ ...rc, [id]: nextStage }));
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId: id, status: s, updatedAt: isoDate, reviewCount: nextStage }),
    });
  };

  // ── RevisionRow component ─────────────────────────────────────────────
  const RevisionRow = ({ p, stage, daysAgo, overdue }: { p: Problem; stage: number; daysAgo: number; overdue: boolean }) => {
    const s = progress[p.id] || 'unsolved';
    const stageInfo = SR_STAGES[stage];
    const colorCls = overdue ? OVERDUE_COLOR : SR_COLOR;
    const label    = overdue ? 'Overdue' : (stageInfo?.label ?? 'Review');
    const stageNum = `${stage + 1}/${SR_STAGES.length}`;
    return (
      <div className="px-4 py-2.5 flex items-center gap-3 border-b border-slate-800/40 last:border-0 hover:bg-slate-800/10 transition-colors">
        {/* Stage badge */}
        <div className="shrink-0 flex flex-col items-center gap-0.5">
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${colorCls}`}>
            {label}
          </span>
          <span className="text-[8px] text-slate-700 font-mono">{stageNum}</span>
        </div>
        {/* Title + phase */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-300 font-medium">{p.title}</span>
            {p.sde && (
              <span className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wide">SDE</span>
            )}
          </div>
          <span className="text-[10px] text-slate-600 font-mono">{daysAgo}d ago · {problemPhase[p.id]}</span>
        </div>
        {/* Status + action */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
            s === 'solved' ? 'bg-emerald-950/60 text-emerald-400' : 'bg-amber-950/60 text-amber-400'
          }`}>
            {s === 'solved' ? '✓ solved' : '~ hint'}
          </span>
          <button
            onClick={() => markReviewed(p.id)}
            title={`Recalled — advances to stage ${stage + 2}/${SR_STAGES.length}`}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-700/60 text-slate-500 hover:border-emerald-600/50 hover:text-emerald-400 hover:bg-emerald-950/20 transition-all">
            Recalled ✓
          </button>
        </div>
      </div>
    );
  };

  // ── Row component ─────────────────────────────────────────────────────
  const Row = ({ p }: { p: Problem }) => {
    const s = progress[p.id] || 'unsolved';
    return (
      <div className={`px-4 py-3 flex items-center gap-3 border-b border-slate-800/40 last:border-0 transition-colors ${
        s === 'solved' ? 'bg-emerald-950/10' : s === 'revisit' ? 'bg-rose-950/10' : 'hover:bg-slate-800/20'
      }`}>
        {/* Status dot */}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          s === 'solved' ? 'bg-emerald-500' : s === 'hint' ? 'bg-amber-400' : s === 'revisit' ? 'bg-rose-500' : 'bg-slate-700'
        }`} />
        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${
              s === 'solved' ? 'text-slate-500 line-through' : s === 'revisit' ? 'text-rose-200' : s === 'hint' ? 'text-amber-200' : 'text-slate-200'
            }`}>{p.title}</span>
            {p.sde && <span className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wide">SDE</span>}
          </div>
          <span className="text-[10px] text-slate-600 font-mono">{p.day}</span>
        </div>
        {/* Buttons */}
        <div className="flex gap-1 shrink-0">
          <button onClick={() => toggle(p.id, 'solved')} title="Solved"
            className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
              s === 'solved'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'border-slate-700/60 text-slate-600 hover:border-emerald-600/50 hover:text-emerald-500 hover:bg-emerald-950/20'
            }`}>✓</button>
          <button onClick={() => toggle(p.id, 'hint')} title="Needed hint"
            className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
              s === 'hint'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'border-slate-700/60 text-slate-600 hover:border-amber-600/50 hover:text-amber-500 hover:bg-amber-950/20'
            }`}>~</button>
          <button onClick={() => toggle(p.id, 'revisit')} title="Need to revise"
            className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
              s === 'revisit'
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'border-slate-700/60 text-slate-600 hover:border-rose-600/50 hover:text-rose-500 hover:bg-rose-950/20'
            }`}>↺</button>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* ─── Header ─────────────────────────────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">Striver A2Z DSA</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Apr 27 – Jul 26, 2026 · 426 problems</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-emerald-400 leading-none">
                {total > 0 ? Math.round(((solved + hinted) / total) * 100) : 0}%
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">complete</div>
            </div>
          </div>
          {/* Segmented progress bar */}
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
            <div className="h-full flex rounded-full overflow-hidden">
              <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(solved / total) * 100}%` }} />
              <div className="bg-amber-400 transition-all duration-500" style={{ width: `${(hinted / total) * 100}%` }} />
            </div>
          </div>
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { label: 'Total',   val: total,    cls: 'text-slate-300',  bg: 'bg-slate-800/60' },
              { label: 'Solved',  val: solved,   cls: 'text-emerald-400', bg: 'bg-emerald-950/40 border border-emerald-900/30' },
              { label: 'Hint',    val: hinted,   cls: 'text-amber-400',  bg: 'bg-amber-950/30 border border-amber-900/20' },
              { label: 'Revise',  val: toRevise, cls: 'text-rose-400',   bg: 'bg-rose-950/30 border border-rose-900/20' },
            ].map(({ label, val, cls, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-2.5`}>
                <div className={`text-xl font-black ${cls}`}>{val}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Tabs ───────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-800 rounded-xl">
          {([['phase','Phase'], ['day','Calendar'], ['completed','Done'], ['revision','Revise']] as const).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)}
              className={`relative flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === v ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}>
              {label}
              {v === 'revision' && toRevise > 0 && (
                <span className="absolute -top-1 -right-0.5 min-w-[14px] h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5">
                  {toRevise > 9 ? '9+' : toRevise}
                </span>
              )}
              {v === 'completed' && (solved + hinted) > 0 && (
                <span className="absolute -top-1 -right-0.5 min-w-[14px] h-3.5 bg-emerald-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5">
                  {(solved + hinted) > 99 ? '99+' : solved + hinted}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── PHASE VIEW ─────────────────────────────────────────── */}
        {view === 'phase' && (
          <div className="space-y-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {Object.keys(dataset).map(ph => {
                const phProbs = dataset[ph] as Problem[];
                const phDone = phProbs.filter(p => progress[p.id] === 'solved' || progress[p.id] === 'hint').length;
                const pct = Math.round((phDone / phProbs.length) * 100);
                return (
                  <button key={ph} onClick={() => setActivePhase(ph)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-all ${
                      activePhase === ph
                        ? 'bg-slate-700 text-white border-slate-600'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}>
                    {ph.replace('PHASE ', 'P').split(':')[0]}
                    <span className={`ml-1.5 font-normal text-[9px] ${pct === 100 ? 'text-emerald-400' : pct > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{pct}%</span>
                  </button>
                );
              })}
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-100 text-sm">{activePhase}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {(dataset[activePhase] as Problem[])?.filter(p => progress[p.id] === 'solved').length} solved
                    {' · '}{(dataset[activePhase] as Problem[])?.filter(p => progress[p.id] === 'hint').length} hint
                    {' · '}{(dataset[activePhase] as Problem[])?.filter(p => progress[p.id] === 'revisit').length} revise
                  </div>
                </div>
                <span className="text-sm font-black text-slate-300">
                  {(dataset[activePhase] as Problem[])?.filter(p => progress[p.id] === 'solved' || progress[p.id] === 'hint').length}
                  <span className="text-slate-600 font-normal text-xs">/{(dataset[activePhase] as Problem[])?.length}</span>
                </span>
              </div>
              <div>{(dataset[activePhase] as Problem[])?.map(p => <Row key={p.id} p={p} />)}</div>
            </div>
          </div>
        )}

        {/* ─── CALENDAR VIEW ──────────────────────────────────────── */}
        {view === 'day' && (
          <div className="flex flex-col md:flex-row gap-4 items-start">

            {/* LEFT: compact calendar sidebar */}
            <div className="w-full md:w-56 shrink-0 space-y-2 md:sticky md:top-4">
              {/* Legend */}
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-[9px] text-slate-500 px-0.5 pb-1">
                {[
                  { color: 'bg-rose-700/70',    label: 'Overdue' },
                  { color: 'bg-amber-700/60',   label: 'Partial' },
                  { color: 'bg-emerald-700/60', label: 'Done' },
                  { color: 'ring-1 ring-blue-400', label: 'Today' },
                ].map(({ color, label }) => (
                  <span key={label} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-sm ${color} inline-block shrink-0`} />
                    {label}
                  </span>
                ))}
              </div>

              {calMonths.map(({ name, month, days }) => {
                const grid = buildMonthGrid(month, days);
                const hasStudyDays = grid.some(d => d !== null && isInStudyRange(month, d));
                if (!hasStudyDays) return null;
                return (
                  <div key={name} className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-3 py-1.5 bg-slate-800/30 border-b border-slate-800">
                      <h3 className="font-bold text-slate-300 text-[11px]">{name}</h3>
                    </div>
                    <div className="p-2">
                      {/* Day-of-week headers */}
                      <div className="grid grid-cols-7 mb-1">
                        {['M','T','W','T','F','S','S'].map((d, i) => (
                          <div key={i} className="text-center text-[8px] font-bold text-slate-700">{d}</div>
                        ))}
                      </div>
                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {grid.map((day, idx) => {
                          if (day === null) return <div key={idx} className="h-7" />;
                          if (!isInStudyRange(month, day)) {
                            return <div key={idx} className="h-7 flex items-center justify-center text-[10px] text-slate-800 font-medium">{day}</div>;
                          }
                          const dk = buildDayKey(month, day);
                          const probs = problemsByDay[dk] || [];
                          const status = probs.length > 0 ? dayStatus(dk) : 'empty';
                          const isSelected = activeDayKey === dk;
                          return (
                            <button key={idx}
                              onClick={() => probs.length > 0 && setActiveDayKey(dk)}
                              className={`h-7 rounded-md flex flex-col items-center justify-center transition-all text-[10px] font-bold ${
                                probs.length > 0 ? 'cursor-pointer' : 'cursor-default'
                              } ${cellStyle[status] || 'text-slate-700'} ${
                                isSelected && probs.length > 0 ? 'ring-2 ring-white/40 ring-offset-1 ring-offset-slate-900' : ''
                              }`}>
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Selected day problems + revision */}
            <div className="flex-1 min-w-0 space-y-4">
              {activeDayKey && (problemsByDay[activeDayKey] || []).length > 0 ? (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                  <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-100">{activeDayKey}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {(problemsByDay[activeDayKey] || []).filter(p => progress[p.id] === 'solved' || progress[p.id] === 'hint').length}
                        /{(problemsByDay[activeDayKey] || []).length} done
                        {(problemsByDay[activeDayKey] || []).filter(p => progress[p.id] === 'revisit').length > 0 &&
                          ` · ${(problemsByDay[activeDayKey] || []).filter(p => progress[p.id] === 'revisit').length} to revise`}
                      </div>
                    </div>
                    {(() => {
                      const st = dayStatus(activeDayKey);
                      const cfg: Record<string, [string, string]> = {
                        overdue:  ['bg-rose-950/60 text-rose-400',       'Overdue'],
                        partial:  ['bg-amber-950/50 text-amber-400',     'In Progress'],
                        done:     ['bg-emerald-950/50 text-emerald-400', 'Complete'],
                        today:    ['bg-blue-950/50 text-blue-400',       'Today'],
                        todayDone:['bg-emerald-950/50 text-emerald-400', 'Today ✓'],
                        future:   ['bg-slate-800 text-slate-400',        'Upcoming'],
                      };
                      const [style, label] = cfg[st] || ['bg-slate-800 text-slate-400', ''];
                      return <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${style}`}>{label}</span>;
                    })()}
                  </div>
                  <div>{(problemsByDay[activeDayKey] || []).map(p => <Row key={p.id} p={p} />)}</div>
                  {revisionNotes[activeDayKey] && (
                    <div className="px-4 py-3 border-t border-amber-900/30 bg-amber-950/10 flex gap-2.5 items-start">
                      <span className="text-amber-500 shrink-0 mt-0.5">🔁</span>
                      <span className="text-[11px] text-amber-300/80 leading-relaxed">{revisionNotes[activeDayKey]}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center">
                  <p className="text-slate-500 text-sm">Select a day from the calendar.</p>
                </div>
              )}

              {/* ── Spaced Revision Queue ──────────────────────────────────── */}
              {(() => {
                if (!activeDayKey) return null;
                const revList = revisionDueForDay(activeDayKey);
                // If nothing is due, check if some of this day's problems were solved today
                // → show a hint that revision starts tomorrow (1-day interval)
                if (revList.length === 0) {
                  const dayProbs = problemsByDay[activeDayKey] || [];
                  const solvedToday = dayProbs.filter(p => {
                    const s = progress[p.id];
                    if (s !== 'solved' && s !== 'hint') return false;
                    const ua = updatedAt[p.id];
                    if (!ua) return false;
                    const d = new Date(ua);
                    const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                    return dOnly.getTime() === parseDayKey(activeDayKey)?.getTime();
                  });
                  if (solvedToday.length === 0) return null;
                  return (
                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-slate-500 text-base">🕐</span>
                      <p className="text-[11px] text-slate-500">
                        <strong className="text-slate-400">{solvedToday.length} problem{solvedToday.length !== 1 ? 's' : ''} solved today</strong>
                        {' — '}first revision appears <strong className="text-slate-400">tomorrow</strong> (1-day interval). Select tomorrow in the calendar to see them.
                      </p>
                    </div>
                  );
                }
                const overdueList = revList.filter(x => x.overdue);
                const scheduledList = revList.filter(x => !x.overdue);
                const overdueShown = overdueList.slice(0, OVERDUE_DAILY_CAP);
                const overdueHidden = overdueList.length - overdueShown.length;
                const displayList = [...overdueShown, ...scheduledList];
                const groupedByStage: Record<number, typeof scheduledList> = {};
                for (const item of scheduledList) {
                  if (!groupedByStage[item.stage]) groupedByStage[item.stage] = [];
                  groupedByStage[item.stage].push(item);
                }
                return (
                  <div className="bg-slate-900/80 border border-indigo-900/30 rounded-xl overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className="px-4 py-3 bg-indigo-950/20 border-b border-indigo-900/20 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-indigo-300 text-sm flex items-center gap-2">
                          🧠 Spaced Revision Due
                          <span className="text-[10px] font-normal text-indigo-400/70 bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded-full">
                            ~{Math.ceil(displayList.length * 2)} min
                          </span>
                        </div>
                        <div className="text-[10px] text-indigo-400/50 mt-0.5">
                          {displayList.length} problem{displayList.length !== 1 ? 's' : ''}
                          {' · '}
                          recall intuition + pseudocode + O(n) — don&apos;t re-code
                        </div>
                      </div>
                      {/* Summary badges */}
                      <div className="flex gap-1 flex-wrap justify-end shrink-0">
                        {overdueShown.length > 0 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${OVERDUE_COLOR}`}>
                            {overdueHidden > 0
                              ? `Overdue ${overdueShown.length} of ${overdueList.length}`
                              : `Overdue ×${overdueShown.length}`}
                          </span>
                        )}
                        {SR_STAGES.map((s, i) => groupedByStage[i]?.length > 0 ? (
                          <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${SR_COLOR}`}>
                            {s.label} ×{groupedByStage[i].length}
                          </span>
                        ) : null)}
                      </div>
                    </div>
                    {/* Problem rows */}
                    <div>
                      {displayList.map(({ problem, stage, daysAgo, overdue }) => (
                        <RevisionRow key={problem.id} p={problem} stage={stage} daysAgo={daysAgo} overdue={overdue} />
                      ))}
                    </div>
                    {/* "N more overdue" separator shown between overdue and SR batches */}
                    {overdueHidden > 0 && (
                      <div className="px-4 py-2.5 border-t border-rose-900/20 bg-rose-950/10 flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${OVERDUE_COLOR}`}>+{overdueHidden} more</span>
                        <span className="text-[10px] text-rose-400/60">
                          Mark today’s {overdueShown.length} as recalled to reveal the next batch.
                        </span>
                      </div>
                    )}
                    {/* Method reminder */}
                    <div className="px-4 py-2.5 border-t border-indigo-900/20 bg-indigo-950/10">
                      <p className="text-[10px] text-indigo-400/60 leading-relaxed">
                        <strong className="text-indigo-300/70">💡 Mental solve:</strong>
                        {' '}look at title → state pattern &amp; intuition aloud → sketch pseudocode → state time/space complexity.
                        {' '}Click <strong className="text-indigo-300/70">&quot;Recalled ✓&quot;</strong> to advance the review timer to the next interval.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* ─── COMPLETED VIEW ─────────────────────────────────────── */}
        {view === 'completed' && (
          Object.keys(completedByPhase).length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-14 text-center">
              <p className="text-slate-400 font-medium">No problems completed yet.</p>
              <p className="text-slate-600 text-xs mt-2">Mark ✓ (solved) or ~ (needed hint) on any problem.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 px-1">{solved + hinted} done — {solved} solved, {hinted} with hint — across {Object.keys(completedByPhase).length} phases</p>
              {Object.entries(completedByPhase).map(([ph, probs]) => (
                <div key={ph} className="bg-slate-900/80 border border-emerald-900/25 rounded-xl overflow-hidden shadow-xl">
                  <div className="px-4 py-3 bg-emerald-950/15 border-b border-emerald-900/20 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-emerald-300 text-sm">{ph}</div>
                      <div className="text-[10px] text-emerald-600/70 mt-0.5">
                        {probs.filter(p => progress[p.id] === 'solved').length} solved · {probs.filter(p => progress[p.id] === 'hint').length} hint
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400">{probs.length}<span className="text-slate-600 font-normal">/{(dataset[ph] as Problem[]).length}</span></span>
                  </div>
                  <div>{probs.map(p => <Row key={p.id} p={p} />)}</div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ─── REVISION VIEW ──────────────────────────────────────── */}
        {view === 'revision' && (
          Object.keys(revisionByPhase).length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-14 text-center">
              <p className="text-slate-400 font-medium">No problems marked for revision.</p>
              <p className="text-slate-600 text-xs mt-2">Mark ↺ on any problem to add it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 px-1">{toRevise} to revise across {Object.keys(revisionByPhase).length} phases — mark ✓ or ~ to remove.</p>
              {Object.entries(revisionByPhase).map(([ph, probs]) => (
                <div key={ph} className="bg-slate-900/80 border border-rose-900/25 rounded-xl overflow-hidden shadow-xl">
                  <div className="px-4 py-3 bg-rose-950/15 border-b border-rose-900/20 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-rose-300 text-sm">{ph}</div>
                      <div className="text-[10px] text-rose-600/70 mt-0.5">{probs.length} to revise</div>
                    </div>
                  </div>
                  <div>{probs.map(p => <Row key={p.id} p={p} />)}</div>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  );
}