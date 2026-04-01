import React, { useState, useMemo } from 'react';
import type { UserInterface } from '../interface/user';

interface RepoProps {
  name: string;
  description: string;
  isSelected?: boolean;
  onSelect?: (name: string) => void;
}

const RepoCard: React.FC<{ repo: RepoProps; isSelected: boolean; onSelect: (name: string) => void }> = ({
  repo,
  isSelected,
  onSelect
}) => {
  return (
    <div
      className={` flex items-center  rounded-lg p-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary/5 '
          : ''
      }`}
      onClick={() => onSelect(repo.name)}
    >
      <div className="flex items-center justify-between gap-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(repo.name);
          }}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
        />
        <div className="flex-1">

          <h3 className="text-xs font-semibold text-gray-900  mb-1">
            {repo.name}
          </h3>
          <p className="text-xs text-gray-500 ">
            {repo.description || "No description provided."}
          </p>
        </div>

      </div>
    </div>
  );
};

const RepoList = [
  { name: "devcheck", description: "A productivity tool for developers to manage tasks and collaborate with teams." },
  { name: "devcheck-api", description: "Backend API for DevCheck, built with Node.js and Express." },
  { name: "devcheck-frontend", description: "Frontend application for DevCheck, built with React and Tailwind CSS." },
  { name: "devcheck-docs", description: "Documentation for DevCheck, including setup guides and API references." },
];

const Repo: React.FC<{ user: UserInterface }> = ({ user }) => {
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSelect = (repoName: string) => {
    setSelectedRepos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(repoName)) {
        newSet.delete(repoName);
      } else {
        newSet.add(repoName);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRepos.size === filteredRepos.length) {
      setSelectedRepos(new Set());
    } else {
      setSelectedRepos(new Set(filteredRepos.map(repo => repo.name)));
    }
  };

  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return RepoList;
    return RepoList.filter(repo =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold text-gray-900 ">
         Select Repositories
        </h2>
        {selectedRepos.size > 0 && (
          <span className="text-xs text-primary ">
            {selectedRepos.size} selected
          </span>
        )}
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories by name or description..."
            className="w-full text-xs px-4 py-2 rounded-lg border border-gray-300  bg-white  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-gray-900  placeholder-gray-500 "
          />
        </div>

      </div>

      {/* Repository List */}
      {filteredRepos.length > 0 && user.github_connected ? (
        <div className="space-y-3 bg-white rounded-md p-4 shadow-sm">
          {filteredRepos.map((repo, index) => (
            <RepoCard
              key={index}
              repo={repo}
              isSelected={selectedRepos.has(repo.name)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50  rounded-lg border border-gray-200 ">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-xs font-medium text-gray-900 ">No repositories found</h3>
          <p className="mt-1 text-xs text-gray-500 ">
            No repositories match your search criteria.
          </p>
        </div>
      )}

      {/* Selected Repositories Actions */}
      {selectedRepos.size > 0 && (
        <div className="fixed z-10 bottom-4 right-4 bg-white  rounded-lg shadow-lg border border-gray-200 d p-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600 ">
              {selectedRepos.size} repository{selectedRepos.size !== 1 ? 's' : ''} selected
            </span>
            <button
              className="px-4 py-2 bg-primary text-white rounded-md  transition-colors text-xs font-medium"
              onClick={() => {
                console.log('Selected repos:', Array.from(selectedRepos));
                // Handle bulk action here
              }}
            >
              Perform Action
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repo;