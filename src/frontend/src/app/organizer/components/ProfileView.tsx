import { Avatar } from "../../../components/Avatar";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { profileService } from "../../../services/profileService";

export function ProfileView() {
  const { data, isLoading, error } = useFetch(profileService.getProfile);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold text-navy-900">Hồ sơ cá nhân</h1>
      {isLoading && <StateMessage message="Đang tải dữ liệu..." />}
      {error && <StateMessage message={error} isError />}
      {data && (
        <div className="card flex max-w-xl flex-col gap-4 p-6 text-sm">
          <div className="flex items-center gap-3">
            <Avatar name={data.fullName} />
            <div>
              <p className="font-semibold text-navy-900">{data.fullName}</p>
              <p className="text-xs text-slate-500">{data.role}</p>
            </div>
          </div>
          <dl className="grid grid-cols-[6rem_1fr] gap-y-2">
            <dt className="text-slate-500">Email</dt>
            <dd>{data.email}</dd>
            <dt className="text-slate-500">Điện thoại</dt>
            <dd>{data.phone}</dd>
            <dt className="text-slate-500">Giới thiệu</dt>
            <dd>{data.bio}</dd>
          </dl>
        </div>
      )}
    </section>
  );
}
