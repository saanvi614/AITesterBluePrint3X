'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ContentRow } from '@/lib/types';
import Image from 'next/image';

interface Props {
  row: ContentRow | null;
}

type TabKey = 'linkedin' | 'medium' | 'instagram' | 'youtube' | 'devto' | 'images';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'linkedin',  label: 'LinkedIn' },
  { key: 'medium',    label: 'Medium' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'youtube',   label: 'YouTube' },
  { key: 'devto',     label: 'Dev.to' },
  { key: 'images',    label: 'Images' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function PlainContent({ text, label }: { text: string; label: string }) {
  if (!text) return <p className="text-gray-500 text-sm italic">Not generated yet.</p>;
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-500">{label}</span>
        <CopyButton text={text} />
      </div>
      <pre className="whitespace-pre-wrap text-sm text-gray-200 bg-gray-950 rounded-lg p-4 border border-gray-800 leading-relaxed">
        {text}
      </pre>
    </div>
  );
}

function MarkdownContent({ text, label }: { text: string; label: string }) {
  if (!text) return <p className="text-gray-500 text-sm italic">Not generated yet.</p>;
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-500">{label}</span>
        <CopyButton text={text} />
      </div>
      <div className="prose prose-invert prose-sm max-w-none bg-gray-950 rounded-lg p-4 border border-gray-800">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}

function ImageGrid({ row }: { row: ContentRow }) {
  const images = [
    { label: 'Medium Cover (16:9)',    src: row.mediumImage,   w: 1280, h: 720 },
    { label: 'LinkedIn (1200×627)',    src: row.linkedinImage, w: 1200, h: 627 },
    { label: 'Instagram (1080×1080)', src: row.igImage,       w: 1080, h: 1080 },
  ];

  return (
    <div className="grid gap-6">
      {images.map(({ label, src, w, h }) => (
        <div key={label} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-3">{label}</p>
          {src ? (
            <div className="relative w-full" style={{ aspectRatio: `${w}/${h}` }}>
              <Image
                src={src}
                alt={label}
                fill
                className="object-cover rounded-lg"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-lg bg-gray-900 border border-gray-800 text-gray-600 text-sm"
              style={{ aspectRatio: `${w}/${h}` }}
            >
              Not generated yet
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ContentTabs({ row }: Props) {
  const [active, setActive] = useState<TabKey>('linkedin');

  if (!row) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
        No content for today. Run the pipeline to generate content.
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
              active === tab.key
                ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-400/5'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
        {active === 'linkedin'  && <PlainContent    text={row.linkedinPost}  label="LinkedIn Post (~150-200 words)" />}
        {active === 'medium'    && <MarkdownContent text={row.mediumArticle} label="Medium Article (3000 words)" />}
        {active === 'instagram' && <PlainContent    text={row.igScript}      label="Instagram Reel/Carousel Script" />}
        {active === 'youtube'   && <PlainContent    text={row.ytScript}      label="YouTube Script with Timestamps" />}
        {active === 'devto'     && <MarkdownContent text={row.devtoArticle}  label="Dev.to Article (2000 words)" />}
        {active === 'images'    && <ImageGrid row={row} />}
      </div>
    </div>
  );
}
