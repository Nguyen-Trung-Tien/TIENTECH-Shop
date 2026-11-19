import React from "react";
import {
  Camera,
  X,
  Edit3,
  Lock,
  Award,
  Star,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "../../../components/UI";
import { getTierProgress, LOYALTY_TIERS } from "../../../utils/loyaltyHelper";
import { getRankConfig } from "./profileConstants";

const RankBadgeIcon = ({ iconType }) => {
  if (iconType === "star") return <Star className="size-3" />;
  if (iconType === "award") return <Award className="size-3" />;
  return <User className="size-3" />;
};

const ProfileHeroCard = ({
  user,
  formData,
  isEditing,
  onToggleEdit,
  onOpenAvatarModal,
  onOpenPasswordModal,
}) => {
  const rankConfig = getRankConfig(user?.rank);
  const tierInfo = getTierProgress(user?.points, user?.rank);

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[32px] border border-slate-200/80 dark:border-dark-border shadow-xl overflow-hidden relative">
      <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
        <div className="absolute -bottom-10 -right-10 size-48 sm:size-64 bg-white/10 rounded-full blur-2xl" />
      </div>

      <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-0 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left min-w-0">
            <button
              type="button"
              className="group relative size-28 sm:size-36 rounded-full border-4 border-white dark:border-dark-surface shadow-2xl cursor-pointer overflow-hidden bg-slate-100 dark:bg-dark-bg shrink-0 ring-4 ring-primary/20"
              onClick={onOpenAvatarModal}
              title="Đổi ảnh đại diện"
              aria-label="Đổi ảnh đại diện"
            >
              <img
                src={formData.avatar || "/images/no-image.png"}
                alt={formData.username}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white size-6 mb-1" />
                <span className="text-[10px] font-black text-white uppercase tracking-wider">
                  Đổi ảnh
                </span>
              </div>
            </button>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight break-words [overflow-wrap:anywhere]">
                  {formData.username || "Người dùng"}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider shadow-xs ${rankConfig.badgeBg}`}
                >
                  <RankBadgeIcon iconType={rankConfig.iconType} />
                  {rankConfig.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-dark-text-secondary break-all">
                {formData.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            <Button
              variant={isEditing ? "secondary" : "primary"}
              size="md"
              className="flex-1 sm:flex-initial shadow-lg shadow-primary/10 rounded-2xl min-h-[44px]"
              icon={isEditing ? X : Edit3}
              onClick={onToggleEdit}
            >
              {isEditing ? "HỦY CHỈNH SỬA" : "CHỈNH SỬA HỒ SƠ"}
            </Button>
            <Button
              variant="outline"
              size="md"
              className="flex-1 sm:flex-initial font-bold bg-white dark:bg-dark-bg border-slate-200 dark:border-dark-border text-slate-700 dark:text-dark-text-primary rounded-2xl min-h-[44px]"
              icon={Lock}
              onClick={onOpenPasswordModal}
            >
              ĐỔI MẬT KHẨU
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-slate-100 dark:border-dark-border">
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-dark-bg/60 border border-slate-100 dark:border-dark-border flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Award className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                Hạng hội viên
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {user?.rank || "Thành viên Đồng"}
              </p>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-dark-bg/60 border border-slate-100 dark:border-dark-border flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Star className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                Điểm thưởng
              </p>
              <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
                {user?.points || 0} PTS
              </p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-dark-bg/60 border border-slate-100 dark:border-dark-border flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Calendar className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                Tham gia từ
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-blue-50/60 dark:from-amber-950/20 dark:via-dark-bg/80 dark:to-blue-950/20 border border-amber-200/70 dark:border-dark-border space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">
                Tiến trình hạng {tierInfo.currentTier.label}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-black shrink-0">
                {tierInfo.points.toLocaleString()} PTS
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-dark-text-secondary">
              {tierInfo.nextTier
                ? `Cần thêm ${tierInfo.pointsToNext.toLocaleString()} điểm để lên ${tierInfo.nextTier.label}`
                : "Bạn đang ở hạng thành viên cao nhất!"}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-primary rounded-full transition-all duration-500"
              style={{ width: `${tierInfo.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 flex-wrap gap-2">
            {LOYALTY_TIERS.map((tier) => (
              <span
                key={tier.name}
                className={
                  tier.name === tierInfo.currentTier.name
                    ? "text-primary font-black"
                    : ""
                }
              >
                {tier.name} ({tier.minPoints.toLocaleString()})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeroCard;
