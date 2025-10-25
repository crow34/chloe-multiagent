import React from 'react';
import type { GroundingChunk } from '../types';
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';

interface GroundingSourcesProps {
  chunks: GroundingChunk[];
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ chunks }) => {
  if (!chunks || chunks.length === 0) {
    return null;
  }

  const sources = chunks.flatMap(chunk => {
    const chunkSources = [];
    if (chunk.web) {
      chunkSources.push({ title: chunk.web.title, uri: chunk.web.uri });
    }
    if (chunk.maps) {
      if (chunk.maps.uri) {
        chunkSources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
      }
      chunk.maps.placeAnswerSources?.forEach(source => {
        source.reviewSnippets?.forEach(snippet => {
          chunkSources.push({ title: snippet.title, uri: snippet.uri });
        });
      });
    }
    return chunkSources;
  }).filter((source, index, self) =>
    index === self.findIndex((s) => s.uri === source.uri)
  ); // Deduplicate

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-slate-400 mb-2">Sources:</h4>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors duration-200"
          >
            <span>{source.title}</span>
            <ArrowUpRightIcon className="w-4 h-4" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default GroundingSources;
