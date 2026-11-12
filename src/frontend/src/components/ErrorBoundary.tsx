import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  portalName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem("organizer_active_route");
      localStorage.removeItem("film_contest_active_portal");
    } catch {}
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.hash = "#/organizer";
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Đã khôi phục giao diện {this.props.portalName || "hệ thống"}
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Trình duyệt vừa gặp sự cố tải lại dữ liệu lưu tạm. Hệ thống đã ngăn chặn màn hình trắng và sẵn sàng đưa bạn quay lại bảng điều khiển an toàn.
            </p>
            {this.state.error?.message && (
              <div className="mt-4 rounded-lg bg-slate-100 p-3 text-left text-xs font-mono text-slate-700 overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
              >
                <RefreshCw size={16} />
                <span>Khôi phục về Tổng quan</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = "#/";
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <Home size={16} />
                <span>Về Trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
