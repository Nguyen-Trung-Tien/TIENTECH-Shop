import React from "react";
import { Camera } from "lucide-react";
import { Button, Modal } from "../../../components/UI";

const ProfileAvatarModal = ({
  isOpen,
  onClose,
  preview,
  avatarLoading,
  onFileChange,
  onUpload,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập nhật ảnh đại diện"
      size="md"
      loading={avatarLoading}
      loadingMessage="Đang tải ảnh đại diện..."
    >
      <div className="space-y-6 text-center">
        <div className="size-44 sm:size-48 mx-auto rounded-full border-4 border-slate-200 dark:border-dark-border overflow-hidden shadow-2xl bg-slate-100 dark:bg-dark-bg relative group">
          <img
            src={preview || "/images/no-image.png"}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative group">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            aria-label="Chọn ảnh đại diện mới"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-full h-14 bg-slate-50 dark:bg-dark-bg border-2 border-dashed border-slate-200 dark:border-dark-border rounded-2xl flex items-center justify-center gap-2 group-hover:border-primary group-hover:bg-primary/5 transition-all">
            <Camera className="text-slate-400 group-hover:text-primary transition-colors size-4.5" />
            <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-dark-text-secondary group-hover:text-primary transition-colors">
              Tải ảnh mới từ thiết bị
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            className="flex-1 min-h-[44px]"
            onClick={onClose}
          >
            HỦY BỎ
          </Button>
          <Button
            variant="primary"
            className="flex-1 min-h-[44px]"
            loading={avatarLoading}
            onClick={onUpload}
          >
            CẬP NHẬT NGAY
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileAvatarModal;
