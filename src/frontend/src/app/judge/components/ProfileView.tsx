import { useState } from 'react';
import { Briefcase, Mail, Pencil, Phone, Star, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { judgeService } from '../../../services/judgeService';
import type { JudgeProfile, JudgeProfileChanges } from '../../../types/judge';
import { AsyncState } from './AsyncState';
import { Avatar } from './Avatar';

/** Số năm kinh nghiệm giữ dạng chuỗi khi nhập để người dùng có thể xóa trắng ô */
type ProfileDraft = Omit<JudgeProfileChanges, 'yearsOfExperience'> & { yearsOfExperience: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toDraft(profile: JudgeProfile): ProfileDraft {
  return {
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    specialty: profile.specialty,
    yearsOfExperience: String(profile.yearsOfExperience),
    bio: profile.bio,
  };
}

function validate(draft: ProfileDraft): string | null {
  if (draft.fullName.trim() === '') {
    return 'Vui lòng nhập họ tên';
  }
  if (!EMAIL_PATTERN.test(draft.email.trim())) {
    return 'Email không hợp lệ';
  }
  const years = Number(draft.yearsOfExperience);
  if (draft.yearsOfExperience.trim() === '' || !Number.isInteger(years) || years < 0) {
    return 'Số năm kinh nghiệm phải là số nguyên không âm';
  }
  return null;
}

interface ProfileViewProps {
  profile: JudgeProfile | null;
  onUpdated: () => Promise<void>;
}

export function ProfileView({ profile, onUpdated }: ProfileViewProps) {
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) {
    return <div className="judge-card"><AsyncState isLoading error={null} /></div>;
  }

  const handleSave = async () => {
    if (!draft) {
      return;
    }
    const validationError = validate(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await judgeService.updateProfile({
        ...draft,
        fullName: draft.fullName.trim(),
        email: draft.email.trim(),
        yearsOfExperience: Number(draft.yearsOfExperience),
      });
      await onUpdated();
      setDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(null);
    setError(null);
  };

  const rows: { icon: LucideIcon; label: string; field: Exclude<keyof ProfileDraft, 'bio'>; type: string; value: string }[] = [
    { icon: UserRound, label: 'Họ tên', field: 'fullName', type: 'text', value: profile.fullName },
    { icon: Mail, label: 'Email', field: 'email', type: 'email', value: profile.email },
    { icon: Phone, label: 'Số điện thoại', field: 'phone', type: 'tel', value: profile.phone },
    { icon: Briefcase, label: 'Chuyên môn', field: 'specialty', type: 'text', value: profile.specialty },
    { icon: Star, label: 'Kinh nghiệm (năm)', field: 'yearsOfExperience', type: 'number', value: `${profile.yearsOfExperience} năm` },
  ];

  return (
    <section className="judge-card max-w-3xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar name={profile.fullName} imageUrl={profile.avatarUrl} sizeClass="h-24 w-24" textClass="text-3xl" />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
          <p className="text-sm text-slate-500">Giám khảo</p>
        </div>
        {!draft && (
          <button type="button" onClick={() => setDraft(toDraft(profile))} className="judge-btn-outline">
            <Pencil className="h-4 w-4" /> Chỉnh sửa
          </button>
        )}
      </div>

      <dl className="mt-6 divide-y divide-slate-100 text-sm">
        {rows.map(({ icon: Icon, label, field, type, value }) => (
          <div key={label} className="grid grid-cols-[24px_130px_1fr] items-center gap-2 py-3">
            <Icon className="h-4 w-4 text-blue-600" />
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-slate-800">
              {draft ? (
                <input
                  type={type}
                  min={type === 'number' ? 0 : undefined}
                  value={draft[field]}
                  onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
                  className="judge-input w-full py-1.5"
                  aria-label={label}
                />
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-slate-900">Tiểu sử</h3>
        {draft ? (
          <textarea
            rows={4}
            value={draft.bio}
            onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
            className="judge-input mt-2 w-full resize-none"
            aria-label="Tiểu sử"
          />
        ) : (
          <p className="mt-2 text-sm leading-6 text-slate-600">{profile.bio}</p>
        )}
      </div>

      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {draft && (
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={handleCancel} disabled={isSaving} className="judge-btn-outline">Hủy</button>
          <button type="button" onClick={() => void handleSave()} disabled={isSaving} className="judge-btn-primary">Lưu thay đổi</button>
        </div>
      )}
    </section>
  );
}
