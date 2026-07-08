import React, { useEffect, useState } from "react";
import { useToast } from '../../../components/ui/toast';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Layers,
  ChevronRight,
} from "lucide-react";

import SpecializationFormModal from "../components/specializationFormModal";

/* =========================
   SERVICES
========================= */
import {
  getSpecializations,
  deleteSpecialization,
} from "../services/specializationService";

import {
  getSpecializationLevels,
  deleteSpecializationLevel,
} from "../services/specializationLevelService";

/* =========================
   PAGE
========================= */
export default function SpecializationListPage() {
  const toast = useToast();

  const getErrorMessage = (err) => {
    return err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
  };
  const [specs, setSpecs] = useState([]);

  const [selectedSpecId, setSelectedSpecId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  /* loading */
  const [pageLoading, setPageLoading] = useState(true);
const [isActionLoading, setIsActionLoading] = useState(false);
  /* modal */
  const [modalOpen, setModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState("SPEC_ADD");

  const [editTarget, setEditTarget] = useState(null);

  const [parentSpecId, setParentSpecId] = useState(null);

  /* =========================
      LOAD DATA
  ========================= */
  const fetchData = async () => {
    try {
      setPageLoading(true);

      /* specialization */
      const specializationData = await getSpecializations();

      /* levels */
      const levelData = await getSpecializationLevels();

      /* merge level vào specialization */
      const mergedData = specializationData.map((spec) => ({
        ...spec,

        levels: levelData.filter(
          (lvl) =>
            lvl.specializationId === spec.id ||
            lvl.specialization?.id === spec.id ||
            lvl.specializationResponse?.id === spec.id
        ),
      }));

      setSpecs(mergedData);

      if (mergedData.length > 0 && !selectedSpecId) {
        setSelectedSpecId(mergedData[0].id);
      }
    } catch (error) {
      console.error(error);

      alert("Không tải được dữ liệu");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* current specialization */
  const currentSpec = specs.find((s) => s.id === selectedSpecId);

  /* search */
  const filteredSpecs = specs.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

 /* =========================
     DELETE SPECIALIZATION
  ========================= */
  const handleDeleteSpec = async (item) => {
    if (!window.confirm(`Xóa chuyên môn "${item.name}" ?`)) return;

    try {
      setIsActionLoading(true);
      await deleteSpecialization(item.id);
      await fetchData(); 
      if (selectedSpecId === item.id) setSelectedSpecId(null);
      toast.success("Đã xóa chuyên môn thành công!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsActionLoading(false);
    }
  };

  /* =========================
     DELETE LEVEL
  ========================= */
  const handleDeleteLevel = async (levelItem) => {
    if (!window.confirm(`Xóa level "${levelItem.name}" ?`)) return;

    try {
      setIsActionLoading(true);
      await deleteSpecializationLevel(levelItem.id);
      await fetchData();
      toast.success("Đã xóa level thành công!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsActionLoading(false);
    }
  };
  /* =========================
      LOADING
  ========================= */
  if (pageLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center text-sm text-slate-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 h-[calc(100vh-110px)] overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0">
        <h1 className="text-xl font-bold text-slate-900">
          Danh mục cấu trúc Chuyên môn
        </h1>

        <p className="text-xs text-slate-500">
          Quản lý chuyên môn và phân tầng level.
        </p>
      </div>

      {/* CONTENT */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-5 min-h-0 overflow-hidden pb-2">
        {/* LEFT */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
          {/* SEARCH */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2 shrink-0">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />

              <input
                type="text"
                placeholder="Tìm chuyên môn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* ADD SPEC */}
            <button
              onClick={() => {
                setModalMode("SPEC_ADD");
                setEditTarget(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition hover:opacity-90 bg-[#1b3392] shrink-0"
            >
              <Plus size={14} />
              Chuyên môn
            </button>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0">
            {filteredSpecs.map((spec) => {
              const isSelected = spec.id === selectedSpecId;

              return (
                <div
                  key={spec.id}
                  onClick={() => setSelectedSpecId(spec.id)}
                  className={`p-3.5 flex items-start justify-between cursor-pointer transition select-none ${
                    isSelected
                      ? "bg-blue-50/70 border-r-4 border-blue-600"
                      : "hover:bg-slate-50/40"
                  }`}
                >
                  {/* INFO */}
                  <div className="space-y-1 min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 uppercase shrink-0">
                        {spec.code}
                      </span>

                      <h3 className="text-xs font-bold text-slate-800 truncate">
                        {spec.name}
                      </h3>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">
                      {spec.description}
                    </p>

                    <div className="text-[10px] font-bold text-blue-600 bg-blue-100/60 w-max px-2 py-0.5 rounded-md">
                      {spec.levels?.length || 0} level
                    </div>
                  </div>

                  {/* ACTION */}
                  <div
                    className="flex items-center gap-1.5 text-slate-400 pt-0.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setModalMode("SPEC_EDIT");
                        setEditTarget(spec);
                        setModalOpen(true);
                      }}
                      className="hover:text-blue-600 p-1"
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      onClick={() => handleDeleteSpec(spec)}
                      className="hover:text-rose-500 p-1"
                    >
                      <Trash2 size={13} />
                    </button>

                    <ChevronRight
                      size={15}
                      className={`text-slate-300 transition ${
                        isSelected ? "translate-x-0.5 text-blue-500" : ""
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
          {currentSpec ? (
            <>
              {/* HEADER */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
                <div className="min-w-0 pr-2">
                  <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers size={14} className="text-blue-600 shrink-0" />
                    Cấu trúc tầng:
                    <span className="text-blue-600 font-extrabold truncate">
                      {currentSpec.name}
                    </span>
                  </h2>
                </div>

                {/* ADD LEVEL */}
                <button
                  onClick={() => {
                    setModalMode("LEVEL_ADD");
                    setParentSpecId(currentSpec.id);
                    setEditTarget(null);
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition hover:opacity-90 bg-[#1b3392] shrink-0"
                >
                  <Plus size={14} />
                  Thêm mức (Level)
                </button>
              </div>

              {/* TABLE */}
              <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full text-left table-fixed border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-[75px] text-center">Bậc</th>

                      <th className="py-2.5 px-3 w-[120px]">Mã Level</th>

                      <th className="py-2.5 px-3">Tên tầng</th>

                      <th className="py-2.5 px-3 w-[80px] text-center">
                        Trạng thái
                      </th>

                      <th className="py-2.5 px-4 w-[90px] text-center">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                    {currentSpec.levels?.map((lvl) => (
                      <tr
                        key={lvl.id}
                        className="hover:bg-slate-50/40 transition"
                      >
                        <td className="py-2.5 px-4 text-center">
                          <span className="w-5 h-5 rounded-md bg-blue-100/60 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-[10px] mx-auto">
                            {lvl.levelOrder}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 truncate">
                          <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] border border-slate-100">
                            {lvl.code}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 min-w-0">
                          <div className="font-bold text-slate-800 truncate">
                            {lvl.name}
                          </div>

                          <div className="text-[10px] font-normal text-slate-400 truncate mt-0.5">
                            {lvl.description}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {lvl.isActive ? (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded">
                              Mở
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              Khóa
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-slate-400">
                            <button
                              onClick={() => {
                                setModalMode("LEVEL_EDIT");
                                setParentSpecId(currentSpec.id);
                                setEditTarget(lvl);
                                setModalOpen(true);
                              }}
                              className="hover:text-blue-600 p-0.5"
                            >
                              <Pencil size={13} />
                            </button>

                            <button
                              onClick={() => handleDeleteLevel(lvl)}
                              className="hover:text-rose-500 p-0.5"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="m-auto text-center text-xs text-slate-400 italic">
              Chọn chuyên môn bên trái
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <SpecializationFormModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
        initialData={editTarget}
        parentSpecId={parentSpecId}
      />
    </div>
  );
}
