"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Pencil, X, Trash2 } from "lucide-react";
import { DEFAULT_QUICKLINKS, getDomain, type Quicklink } from "@/utils/quicklinks";
import { safeLocalStorage } from "@/utils/safeStorage";

function Favicon({ url, title }: { url: string; title: string }) {
  const [error, setError] = useState(false);
  const domain = getDomain(url);

  if (error || !domain) {
    return (
      <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-medium text-sm select-none shrink-0 transition-transform duration-300">
        {title.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
      alt=""
      onError={() => setError(true)}
      className="w-8 h-8 object-contain rounded-md filter dark:brightness-95 select-none pointer-events-none transition-transform duration-300 shrink-0"
    />
  );
}

export default function Quicklinks() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    return safeLocalStorage.getItem("slate-settings-quicklinks") !== "false";
  });
  const [showLabels, setShowLabels] = useState(() => {
    if (typeof window === "undefined") return true;
    return safeLocalStorage.getItem("slate-settings-quicklinks-labels") !== "false";
  });
  const [showAddButton, setShowAddButton] = useState(() => {
    if (typeof window === "undefined") return true;
    return safeLocalStorage.getItem("slate-settings-quicklinks-add-button") !== "false";
  });
  const [links, setLinks] = useState<Quicklink[]>(() => {
    if (typeof window === "undefined") return [];
    const savedLinks = safeLocalStorage.getItem("slate-quicklinks");
    if (savedLinks) {
      try {
        return JSON.parse(savedLinks);
      } catch {
        return DEFAULT_QUICKLINKS;
      }
    }
    return DEFAULT_QUICKLINKS;
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Quicklink | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    if (typeof window !== "undefined" && !safeLocalStorage.getItem("slate-quicklinks")) {
      safeLocalStorage.setItem("slate-quicklinks", JSON.stringify(DEFAULT_QUICKLINKS));
    }

    const handleUpdate = () => {
      const savedVisible = safeLocalStorage.getItem("slate-settings-quicklinks") !== "false";
      setVisible(savedVisible);

      const savedLabels = safeLocalStorage.getItem("slate-settings-quicklinks-labels") !== "false";
      setShowLabels(savedLabels);

      const savedAddButton = safeLocalStorage.getItem("slate-settings-quicklinks-add-button") !== "false";
      setShowAddButton(savedAddButton);

      const savedLinks = safeLocalStorage.getItem("slate-quicklinks");
      if (savedLinks) {
        try {
          setLinks(JSON.parse(savedLinks));
        } catch {
          setLinks(DEFAULT_QUICKLINKS);
        }
      }
    };

    window.addEventListener("slate-quicklinks-settings-updated", handleUpdate);
    return () => {
      window.removeEventListener("slate-quicklinks-settings-updated", handleUpdate);
    };
  }, []);

  const openAddModal = () => {
    setEditingLink(null);
    setNameInput("");
    setUrlInput("");
    setModalError(null);
    setIsModalOpen(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const openEditModal = (link: Quicklink) => {
    setEditingLink(link);
    setNameInput(link.title);
    setUrlInput(link.url);
    setModalError(null);
    setIsModalOpen(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLink(null);
    setNameInput("");
    setUrlInput("");
    setModalError(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !urlInput.trim()) return;

    let formattedUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    let updatedLinks: Quicklink[];

    if (editingLink) {
      updatedLinks = links.map((link) =>
        link.id === editingLink.id
          ? { ...link, title: nameInput.trim(), url: formattedUrl }
          : link
      );
    } else {
      if (links.length >= 12) {
        setModalError("Maximum limit of 12 shortcuts reached.");
        return;
      }
      const newLink: Quicklink = {
        id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: nameInput.trim(),
        url: formattedUrl,
      };
      updatedLinks = [...links, newLink];
    }

    setLinks(updatedLinks);
    safeLocalStorage.setItem("slate-quicklinks", JSON.stringify(updatedLinks));
    closeModal();
  };

  const handleDelete = () => {
    if (!editingLink) return;
    const updatedLinks = links.filter((link) => link.id !== editingLink.id);
    setLinks(updatedLinks);
    safeLocalStorage.setItem("slate-quicklinks", JSON.stringify(updatedLinks));
    closeModal();
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    draggedIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndexRef.current === null || draggedIndexRef.current === index) return;
    if (dragOverIndexRef.current === index) return;
    setDragOverIndex(index);
    dragOverIndexRef.current = index;
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedIndexRef.current = null;
    dragOverIndexRef.current = null;
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const sourceIndex = draggedIndexRef.current;
    if (sourceIndex === null || sourceIndex === index) return;

    const reordered = [...links];
    const [draggedItem] = reordered.splice(sourceIndex, 1);
    reordered.splice(index, 0, draggedItem);

    setLinks(reordered);
    safeLocalStorage.setItem("slate-quicklinks", JSON.stringify(reordered));
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedIndexRef.current = null;
    dragOverIndexRef.current = null;
  };

  if (!mounted || !visible) return null;

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-3 select-none animate-fade-in-up">
      {links.map((link, index) => {
        const isDragging = index === draggedIndex;
        const isOver = index === dragOverIndex;

        return (
          <a
            key={link.id}
            href={link.url}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            className={`group flex flex-col items-center select-none w-16 sm:w-20 transition-all duration-300 ${
              isDragging ? "opacity-35 scale-90" : "opacity-100"
            }`}
          >
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-[400ms] bg-[var(--foreground)]/4 dark:bg-[var(--foreground)]/2.5 border border-[var(--glass-border)]/30 group-hover:scale-110 group-hover:bg-[var(--glass-bg)] group-hover:border-[var(--glass-border-focus)] group-hover:shadow-[0_0_20px_var(--accent-glow)] relative ${
                isOver ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-110 shadow-[0_0_15px_var(--accent-glow)]" : ""
              }`}
            >
              <Favicon key={link.url} url={link.url} title={link.title} />

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openEditModal(link);
                }}
                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-full bg-[var(--background)] border border-[var(--glass-border)] text-[var(--foreground)]/45 hover:text-[var(--accent)] hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                title="Edit quicklink"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
            </div>

            {showLabels && (
              <span className="mt-2.5 text-[10px] sm:text-[11px] font-light tracking-wide text-[var(--foreground)]/45 transition-colors duration-300 group-hover:text-[var(--foreground)]/80 truncate max-w-full px-1">
                {link.title}
              </span>
            )}
          </a>
        );
      })}
 
      {showAddButton && links.length < 12 && (
        <button
          type="button"
          onClick={openAddModal}
          className="group flex flex-col items-center select-none w-16 sm:w-20 transition-all duration-300 cursor-pointer"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-[400ms] bg-[var(--foreground)]/2 dark:bg-[var(--foreground)]/1 border border-dashed border-[var(--glass-border)]/40 group-hover:border-[var(--accent)]/50 group-hover:bg-[var(--glass-bg)] group-hover:scale-110 group-hover:shadow-[0_0_20px_var(--accent-glow)] text-[var(--foreground)]/30 group-hover:text-[var(--accent)]">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-90" />
          </div>
          {showLabels && (
            <span className="mt-2.5 text-[10px] sm:text-[11px] font-light tracking-wide text-[var(--foreground)]/30 group-hover:text-[var(--accent)] transition-colors duration-300">
              Add Link
            </span>
          )}
        </button>
      )}

      {isModalOpen && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div
            ref={modalRef}
            className="w-full max-w-sm rounded-2xl glass-input p-6 flex flex-col gap-4 animate-scale-up text-left relative"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 cursor-pointer transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-semibold text-[var(--foreground)]">
              {editingLink ? "Edit Quicklink" : "Add Quicklink"}
            </h3>

            {modalError && (
              <div className="p-3 text-xs text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/20">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                  Name
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="e.g. GitHub"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                  maxLength={15}
                  className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                  URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://github.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required
                  className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300"
                />
              </div>

              <div className="flex items-center justify-between gap-3 mt-2">
                {editingLink ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 rounded-xl transition-all duration-300 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] border border-[var(--glass-border)] rounded-xl hover:bg-[var(--foreground)]/5 transition-all duration-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 rounded-xl hover:shadow-[0_0_12px_var(--accent-glow)] transition-all duration-300 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
