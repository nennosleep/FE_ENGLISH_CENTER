import { useState, useEffect } from "react";
import { Save, BookOpen, Mail, User, Lock, Shield, Eye, EyeOff, Edit2, X, Loader2 } from "lucide-react";
import { useAuthContext } from "../../../features/auth/context/AuthContext";
import { getTeacherById, updateTeacher } from "../../../services/teacherService";
import { updateAccount } from "../../../services/accountService";
import { changePasswordApi } from "../../../features/auth/services/authService";
import { useToast } from "../../../components/ui/Toast";

export default function TeacherProfilePage() {
  const { user, updateUser, updateToken } = useAuthContext();
  const toast = useToast();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("info");
  
  // --- STATE FOR PROFILE EDITING ---
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    username: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (user?.teacherId) {
          const data = await getTeacherById(user.teacherId);
          setTeacherData(data);
          setEditForm({
            name: data.fullName || user.name || "",
            phone: data.phone || "",
            username: user.username || "",
            email: data.email || user.email || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch teacher profile", error);
        toast.error("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.teacherId]);

  // Reset edit form when cancel editing
  useEffect(() => {
    if (!isEditing && teacherData) {
      setEditForm({
        name: teacherData.fullName || user?.name || "",
        phone: teacherData.phone || "",
        username: user?.username || "",
        email: teacherData.email || user?.email || "",
      });
    }
  }, [isEditing, teacherData, user]);

  async function handleSaveProfile() {
    if (!editForm.name.trim() || !editForm.username.trim() || !editForm.email.trim() || !editForm.phone.trim()) {
      toast.error("Vui lòng điền đủ họ tên, tên đăng nhập, số điện thoại và email.");
      return;
    }

    if (editForm.name.trim().length < 2) {
      toast.error("Họ và tên phải có ít nhất 2 ký tự.");
      return;
    }

    // Username must not be empty (already checked) but has no specific format restrictions.
    // Spaces are already stripped during input.

    // Validate Email
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(editForm.email)) {
      toast.error("Email phải có đuôi @gmail.com");
      return;
    }

    // Validate Phone
    if (!/^0\d{9}$/.test(editForm.phone)) {
      toast.error("Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.");
      return;
    }
    try {
      setSavingProfile(true);
      
      // Trim và Viết hoa chữ cái đầu cho tên (Title Case)
      let trimmedName = editForm.name.trim();
      if (trimmedName) {
        trimmedName = trimmedName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
      const trimmedEmail = editForm.email.trim();
      const trimmedPhone = editForm.phone.trim();
      const trimmedUsername = editForm.username.trim();

      const teacherPayload = {
        fullName: trimmedName,
        phone: trimmedPhone,
        status: teacherData.status,
        maxClasses: teacherData.maxClasses,
        maxHoursPerDay: teacherData.maxHoursPerDay,
        specializationIds: teacherData.specializations?.map(s => s.id) || []
      };

      const accountPayload = {
        username: trimmedUsername,
        email: trimmedEmail
      };
      
      // 1. Cập nhật Account trước (Username, Email)
      if (user.accountId) {
        const accountRes = await updateAccount(user.accountId, accountPayload);
        
        // Cập nhật lại thông tin trong context auth
        if (updateUser) {
          updateUser({ username: trimmedUsername, email: trimmedEmail, name: trimmedName });
        }
        const newToken =
          accountRes?.data?.newToken ??
          accountRes?.newToken ??
          accountRes?.data?.accessToken ??
          accountRes?.accessToken;

        if (newToken && updateToken) {
          updateToken(newToken);
        }
      }

      // 2. Sau khi Account OK, mới cập nhật Teacher (FullName, Phone)
      await updateTeacher(user.teacherId, teacherPayload);

      setTeacherData(prev => ({ ...prev, fullName: trimmedName, phone: trimmedPhone, email: trimmedEmail }));
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ", error);
      const msg = error?.response?.data?.message?.toLowerCase() || "";
      let viMsg = "Có lỗi xảy ra khi cập nhật hồ sơ.";
      if (msg.includes("email already in use") || msg.includes("email already exists")) {
        viMsg = "Email này đã được sử dụng bởi người khác.";
      } else if (msg.includes("teacher code already exists") || msg.includes("username")) {
        viMsg = "Mã giảng viên (Tên đăng nhập) đã tồn tại.";
      } else if (msg.includes("invalid email")) {
        viMsg = "Định dạng email không hợp lệ.";
      } else if (msg.includes("phone")) {
        viMsg = "Số điện thoại không hợp lệ.";
      } else if (error?.response?.data?.message) {
        viMsg = error.response.data.message; // Fallback to provided message if we don't catch it
      }
      toast.error(viMsg);
      // Re-fetch profile data after any error to ensure UI shows actual server state
      try {
        if (user?.teacherId) {
          const data = await getTeacherById(user.teacherId);
          setTeacherData(data);
          setEditForm({
            name: data.fullName || user.name || "",
            phone: data.phone || "",
            username: user.username || "",
            email: data.email || user.email || "",
          });
        }
      } catch (fetchErr) {
        console.error("Lỗi khi tải lại hồ sơ", fetchErr);
      }
    } finally {
      setSavingProfile(false);
    }
  }

  // --- STATE FOR PASSWORD EDITING ---
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  function validatePassword() {
    const errs = {};
    if (!passwordForm.current) errs.current = "Vui lòng nhập mật khẩu hiện tại";
    if (!passwordForm.next) errs.next = "Vui lòng nhập mật khẩu mới";
    else if (passwordForm.next.length < 8) errs.next = "Mật khẩu tối thiểu 8 ký tự";
    else if (!/(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])/.test(passwordForm.next)) {
      errs.next = "Mật khẩu phải chứa ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt";
    }
    if (!passwordForm.confirm) errs.confirm = "Vui lòng xác nhận mật khẩu";
    else if (passwordForm.next !== passwordForm.confirm) errs.confirm = "Mật khẩu xác nhận không khớp";
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSavePassword() {
    if (!validatePassword()) return;
    try {
      setSavingPw(true);
      await changePasswordApi(passwordForm.current, passwordForm.next);
      setPasswordForm({ current: "", next: "", confirm: "" });
      toast.success("Đổi mật khẩu thành công!");
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu", error);
      const msg = error?.response?.data?.message?.toLowerCase() || "";
      let viMsg = "Có lỗi xảy ra khi đổi mật khẩu.";
      if (msg.includes("incorrect") || msg.includes("hiện tại không chính xác")) {
        viMsg = "Mật khẩu hiện tại không chính xác.";
      }
      toast.error(viMsg);
    } finally {
      setSavingPw(false);
    }
  }

  const roleLabel = user?.roles?.includes("ROLE_ADMIN") ? "Quản trị viên" : "Giảng viên";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-slate-600 font-medium">Đang tải hồ sơ...</span>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="text-center py-12 text-slate-500">
        Không tìm thấy thông tin giảng viên.
      </div>
    );
  }

  // Use editForm data for display if we have edited and saved (mock), otherwise fallback
  const displayName = teacherData.fullName || user?.name || user?.username;
  const displayEmail = teacherData.email || user?.email;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* 1. Header & Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{displayName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
              <span className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full font-medium">
                {roleLabel}
              </span>
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {displayEmail}</span>
            </div>
          </div>
        </div>
        
        <div className="flex px-8 overflow-x-auto">
          {[
            { id: "info", label: "Thông tin chung", icon: <User size={16} /> },
            { id: "password", label: "Bảo mật", icon: <Shield size={16} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-2 py-4 mr-8 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 relative">
        {tab === "info" && (
          <div className="space-y-8">
            
            {/* Action Bar for Editing */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-2">
              <h2 className="text-lg font-bold text-slate-800">Hồ sơ của bạn</h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  <Edit2 size={14} /> Chỉnh sửa
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    disabled={savingProfile}
                    className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    <X size={16} /> Hủy
                  </button>
                  <button 
                    onClick={handleSaveProfile} 
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
                  >
                    {savingProfile ? (
                       <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</>
                    ) : (
                       <><Save size={16} /> Lưu thay đổi</>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {/* Personal Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Thông tin cá nhân</h3>
                <div className="space-y-2">
                  {[
                    { label: "Mã định danh", value: teacherData.teacherCode || "N/A", key: "code", editable: false },
                    { label: "Họ và tên", value: editForm.name, key: "name", editable: true },
                    { label: "Tên đăng nhập", value: editForm.username, key: "username", editable: true },
                    { label: "Ngày tham gia", value: teacherData.createdAt ? new Date(teacherData.createdAt).toLocaleDateString("vi-VN") : "N/A", key: "joinDate", editable: false },
                  ].map(({ label, value, key, editable }) => (
                    <div key={key} className="grid grid-cols-3 gap-4 items-center min-h-[40px]">
                      <span className="text-sm text-slate-500">{label}</span>
                      <div className="col-span-2">
                        {isEditing && editable ? (
                          <input 
                            type="text"
                            maxLength={50}
                            value={value}
                             onChange={(e) => {
                               let val = e.target.value;
                               if (key === "name") {
                                 val = val.replace(/[^a-zA-ZÀ-ỹà-ỹĂăÂâĐđÊêÔôƠơƯư\s]/g, '');
                                 val = val.replace(/\s{2,}/g, ' ');
                               }
                               if (key === "username" || key === "email" || key === "phone") {
                                 val = val.replace(/\s/g, ''); // Chặn khoảng trắng
                               }
                               setEditForm(prev => ({...prev, [key]: val}));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-blue-50/30 text-sm font-medium text-slate-900 transition-colors shadow-inner"
                          />
                        ) : (
                          <span className="text-sm font-medium text-slate-800 block px-1">{value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Liên hệ</h3>
                <div className="space-y-2">
                  {[
                    { label: "Email", value: editForm.email, key: "email", editable: true },
                    { label: "Điện thoại", value: editForm.phone, key: "phone", editable: true },
                  ].map(({ label, value, key, editable }) => (
                    <div key={key} className="grid grid-cols-3 gap-4 items-center min-h-[40px]">
                      <span className="text-sm text-slate-500">{label}</span>
                      <div className="col-span-2">
                        {isEditing && editable ? (
                          <input 
                            type="text"
                            maxLength={key === "phone" ? 10 : 100}
                            value={value}
                            onChange={(e) => {
                               let val = e.target.value;
                               if (key === "email" || key === "phone") {
                                 val = val.replace(/\s/g, ''); // Chặn khoảng trắng
                               }
                               if (key === "phone") {
                                 val = val.replace(/\D/g, ''); // Chỉ cho nhập số
                               }
                               setEditForm(prev => ({...prev, [key]: val}));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-blue-50/30 text-sm font-medium text-slate-900 transition-colors shadow-inner"
                          />
                        ) : (
                          <span className="text-sm font-medium text-slate-800 block px-1">{value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

             <div className="pt-4 border-t border-slate-100">
               <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">Chuyên môn & Lịch dạy</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <p className="text-sm text-slate-500 mb-3">Kỹ năng giảng dạy</p>
                    <div className="flex flex-wrap gap-2.5">
                      {teacherData.specializations?.length > 0 ? (
                        teacherData.specializations.map((spec) => (
                          <span key={spec.id} className="px-3.5 py-1.5 bg-blue-50 text-blue-700 text-[0.85rem] rounded-full font-bold border border-blue-200 shadow-sm flex items-center gap-1.5 hover:bg-blue-100 hover:shadow transition-all cursor-default">
                            <BookOpen size={14} className="text-blue-500" />
                            {spec.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400 italic">Chưa có chuyên môn</span>
                      )}
                    </div>
                 </div>
                 
                 <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600 font-medium">Lớp đang nhận</span>
                      <span className="text-sm font-bold text-slate-800">
                         {teacherData.currentClasses ?? 0} / {teacherData.maxClasses || 0}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, ((teacherData.currentClasses ?? 0) / (teacherData.maxClasses || 1)) * 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5"><Lock size={12}/> Giới hạn {teacherData.maxHoursPerDay || 0} giờ dạy/ngày</p>
                 </div>
               </div>
             </div>
          </div>
        )}

        {tab === "password" && (
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Đổi mật khẩu</h3>
            <div className="space-y-5">
              {[
                { key: "current", label: "Mật khẩu hiện tại" },
                { key: "next", label: "Mật khẩu mới" },
                { key: "confirm", label: "Xác nhận mật khẩu mới" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      maxLength={50}
                      type={showPw[key] ? "text" : "password"}
                      value={passwordForm[key]}
                      onChange={(e) => { 
                        setPasswordForm((p) => ({ ...p, [key]: e.target.value.replace(/\s/g, '') })); 
                        setPwErrors((p) => ({ ...p, [key]: "" })); 
                      }}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${pwErrors[key] ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPw[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {pwErrors[key] && <p className="mt-1.5 text-xs text-red-500 font-medium">{pwErrors[key]}</p>}
                </div>
              ))}
              <div className="pt-4">
                <button
                  onClick={handleSavePassword}
                  disabled={savingPw}
                  className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                  {savingPw ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
                  ) : (
                    <><Save size={16} /> Cập nhật mật khẩu</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
