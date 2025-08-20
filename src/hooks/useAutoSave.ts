import { useEffect, useRef } from 'react';
import { useApprovalStore } from '../store/approvalStore';
import { Template } from '../types';

export function useAutoSave(template: Template, sowId: string) {
  const { updateDocument } = useApprovalStore();
  const saveTimeoutRef = useRef<number>();

  useEffect(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = window.setTimeout(() => {
      updateDocument(sowId, {
        content: template,
        updatedAt: new Date().toISOString(),
      });
    }, 180000); // 3 minutes

    // Cleanup on unmount or when template changes
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [template, sowId, updateDocument]);
}