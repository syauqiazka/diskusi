export interface RawComment {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  depth: number;
  parentId?: string | null;
  isBestAnswer: boolean;
  createdAt: Date;
}

export interface CommentTreeNode extends RawComment {
  replies: CommentTreeNode[];
}

/**
 * Menghitung tingkat kedalaman (depth) komentar:
 * - Jika tidak ada parent: depth = 1
 * - Jika ada parent: depth = parentDepth + 1, dengan batas maksimal 3 (clamp).
 */
export function calculateCommentDepth(parentDepth?: number | null): number {
  if (parentDepth === null || parentDepth === undefined) {
    return 1;
  }
  return Math.min(parentDepth + 1, 3);
}

/**
 * Menyusun daftar komentar flat menjadi pohon hierarki bersarang (nested tree)
 * berdasarkan parentId hingga kedalaman maksimal 3 level.
 */
export function buildCommentTree(comments: RawComment[]): CommentTreeNode[] {
  const nodeMap = new Map<string, CommentTreeNode>();
  const roots: CommentTreeNode[] = [];

  for (const comment of comments) {
    nodeMap.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = nodeMap.get(comment.id);
    if (!node) continue;

    if (comment.parentId && nodeMap.has(comment.parentId)) {
      const parent = nodeMap.get(comment.parentId);
      parent?.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

