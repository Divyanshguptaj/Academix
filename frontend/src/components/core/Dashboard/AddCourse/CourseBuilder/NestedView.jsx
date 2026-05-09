import { useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AiFillCaretDown } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import { RiDeleteBin6Line } from "react-icons/ri"
import { RxDragHandleDots2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import {
  deleteSection,
  deleteSubSection,
  reorderSections,
  reorderSubSections,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import ConfirmationModal from "../../../../common/ConfirmationModal"
import SubSectionModal from "./SubSectionModal"

const DND_ACTIVATION = { activationConstraint: { distance: 5 } }

// ── Sortable lecture row ──────────────────────────────────────────────────────
function SortableLecture({ data, sectionId, onEdit, onDelete, onView }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: data._id })

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between gap-x-3 border-b border-richblack-600 py-2">
      <div className="flex items-center gap-x-3 py-1 flex-1 min-w-0 cursor-pointer" onClick={() => onView(data)}>
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing text-richblack-500 hover:text-richblack-300 flex-shrink-0 touch-none"
          title="Drag to reorder"
        >
          <RxDragHandleDots2 className="text-xl" />
        </button>
        <p className="font-medium text-richblack-300 truncate text-sm">{data.title}</p>
        {!data.videoURL && (
          <span className="flex-shrink-0 text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-700/40 px-1.5 py-0.5 rounded">
            No video
          </span>
        )}
      </div>
      <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-x-2 flex-shrink-0">
        <button
          onClick={() => onEdit({ ...data, sectionId })}
          className="p-1 hover:bg-richblack-600 rounded transition-colors"
          title="Edit lecture"
        >
          <MdEdit className="text-lg text-richblack-300 hover:text-white" />
        </button>
        <button
          onClick={() => onDelete(data._id, sectionId)}
          className="p-1 hover:bg-richblack-600 rounded transition-colors"
          title="Delete lecture"
        >
          <RiDeleteBin6Line className="text-lg text-richblack-300 hover:text-pink-400" />
        </button>
      </div>
    </div>
  )
}

// ── Inner DnD context for lectures within one section ─────────────────────────
function LectureList({ section, onView, onEdit, onDelete, onSubDragEnd }) {
  const sensors = useSensors(useSensor(PointerSensor, DND_ACTIVATION))
  const subIds = section.subSection.map((s) => s._id)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => onSubDragEnd(event, section._id)}
    >
      <SortableContext items={subIds} strategy={verticalListSortingStrategy}>
        {section.subSection.map((sub) => (
          <SortableLecture
            key={sub._id}
            data={sub}
            sectionId={section._id}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}

// ── Sortable section card ─────────────────────────────────────────────────────
function SortableSection({
  section,
  onEditName,
  onDeleteSection,
  onAddLecture,
  onViewLecture,
  onEditLecture,
  onDeleteLecture,
  onSubDragEnd,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section._id })

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <details open className="group/section">
        <summary className="flex cursor-pointer items-center justify-between border-b-2 border-richblack-600 py-2 list-none">
          <div className="flex items-center gap-x-2 min-w-0">
            <button
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="cursor-grab active:cursor-grabbing text-richblack-500 hover:text-richblack-300 flex-shrink-0 touch-none"
              title="Drag to reorder section"
            >
              <RxDragHandleDots2 className="text-xl" />
            </button>
            <p className="font-semibold text-richblack-300 truncate">{section.sectionName}</p>
            <span className="flex-shrink-0 text-xs text-richblack-500 ml-1">
              ({section.subSection.length} {section.subSection.length === 1 ? "lecture" : "lectures"})
            </span>
          </div>
          <div className="flex items-center gap-x-2 flex-shrink-0 ml-2">
            <button
              onClick={(e) => { e.preventDefault(); onEditName(section._id, section.sectionName) }}
              className="p-1 hover:bg-richblack-600 rounded transition-colors"
              title="Edit section name"
            >
              <MdEdit className="text-lg text-richblack-300 hover:text-white" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onDeleteSection(section._id) }}
              className="p-1 hover:bg-richblack-600 rounded transition-colors"
              title="Delete section"
            >
              <RiDeleteBin6Line className="text-lg text-richblack-300 hover:text-pink-400" />
            </button>
            <span className="text-richblack-500">|</span>
            <AiFillCaretDown className="text-lg text-richblack-300 group-open/section:rotate-180 transition-transform duration-200" />
          </div>
        </summary>

        <div className="px-4 pb-3 pt-2">
          {section.subSection.length === 0 ? (
            <button
              onClick={() => onAddLecture(section._id)}
              className="w-full my-2 flex items-center justify-center gap-2 border border-dashed border-richblack-500 hover:border-yellow-500 rounded-lg py-3 text-sm text-richblack-400 hover:text-yellow-400 transition-all duration-200 group/cta"
            >
              <FaPlus className="text-xs group-hover/cta:scale-110 transition-transform" />
              Add your first lecture
            </button>
          ) : (
            <LectureList
              section={section}
              onView={onViewLecture}
              onEdit={onEditLecture}
              onDelete={onDeleteLecture}
              onSubDragEnd={onSubDragEnd}
            />
          )}

          {section.subSection.length > 0 && (
            <button
              onClick={() => onAddLecture(section._id)}
              className="mt-3 flex items-center gap-x-1.5 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <FaPlus className="text-xs" />
              Add Lecture
            </button>
          )}
        </div>
      </details>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────
export default function NestedView({ handleChangeEditSectionName }) {
  const { course } = useSelector((state) => state.course)
  const dispatch = useDispatch()

  const [addSubSection, setAddSubsection] = useState(null)
  const [viewSubSection, setViewSubSection] = useState(null)
  const [editSubSection, setEditSubSection] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, DND_ACTIVATION))

  const handleSectionDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return
    const sections = course.courseContent
    const oldIndex = sections.findIndex((s) => s._id === active.id)
    const newIndex = sections.findIndex((s) => s._id === over.id)
    const reordered = arrayMove(sections, oldIndex, newIndex)
    dispatch(setCourse({ ...course, courseContent: reordered }))
    const result = await reorderSections({ courseId: course._id, sectionIds: reordered.map((s) => s._id) })
    if (result) dispatch(setCourse(result))
  }

  const handleSubDragEnd = async ({ active, over }, sectionId) => {
    if (!over || active.id === over.id) return
    const section = course.courseContent.find((s) => s._id === sectionId)
    const oldIndex = section.subSection.findIndex((s) => s._id === active.id)
    const newIndex = section.subSection.findIndex((s) => s._id === over.id)
    const reorderedSubs = arrayMove(section.subSection, oldIndex, newIndex)
    const updatedContent = course.courseContent.map((s) =>
      s._id === sectionId ? { ...s, subSection: reorderedSubs } : s
    )
    dispatch(setCourse({ ...course, courseContent: updatedContent }))
    const result = await reorderSubSections({
      sectionId,
      courseId: course._id,
      subSectionIds: reorderedSubs.map((s) => s._id),
    })
    if (result) dispatch(setCourse(result))
  }

  const handleDeleteSection = async (sectionId) => {
    const result = await deleteSection({ sectionId, courseId: course._id })
    if (result) dispatch(setCourse(result))
    setConfirmationModal(null)
  }

  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    const result = await deleteSubSection({ subSectionId, sectionId, courseId: course._id })
    if (result) dispatch(setCourse(result))
    setConfirmationModal(null)
  }

  const sectionIds = course?.courseContent?.map((s) => s._id) ?? []

  return (
    <>
      <div className="rounded-lg bg-richblack-700 p-4 sm:p-6" id="nestedViewContainer">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
            {course?.courseContent?.map((section) => (
              <SortableSection
                key={section._id}
                section={section}
                onEditName={handleChangeEditSectionName}
                onDeleteSection={(id) =>
                  setConfirmationModal({
                    text1: "Delete this Section?",
                    text2: "All lectures in this section will also be deleted",
                    btn1Text: "Delete",
                    btn2Text: "Cancel",
                    btn1Handler: () => handleDeleteSection(id),
                    btn2Handler: () => setConfirmationModal(null),
                  })
                }
                onAddLecture={(id) => setAddSubsection(id)}
                onViewLecture={(data) => setViewSubSection(data)}
                onEditLecture={(data) => setEditSubSection(data)}
                onDeleteLecture={(subId, secId) =>
                  setConfirmationModal({
                    text1: "Delete this Lecture?",
                    text2: "This lecture will be permanently deleted",
                    btn1Text: "Delete",
                    btn2Text: "Cancel",
                    btn1Handler: () => handleDeleteSubSection(subId, secId),
                    btn2Handler: () => setConfirmationModal(null),
                  })
                }
                onSubDragEnd={handleSubDragEnd}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {addSubSection && (
        <SubSectionModal modalData={addSubSection} setModalData={setAddSubsection} add={true} />
      )}
      {viewSubSection && (
        <SubSectionModal modalData={viewSubSection} setModalData={setViewSubSection} view={true} />
      )}
      {editSubSection && (
        <SubSectionModal modalData={editSubSection} setModalData={setEditSubSection} edit={true} />
      )}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}
