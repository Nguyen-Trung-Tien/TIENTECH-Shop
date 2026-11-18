import { useEffect } from "react";

/**
 * Protects forms/settings pages with unsaved changes from accidental tab close or reload.
 */
export const useUnsavedChangesGuard = (isDirty, message = "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang?") => {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, message]);
};

export default useUnsavedChangesGuard;
