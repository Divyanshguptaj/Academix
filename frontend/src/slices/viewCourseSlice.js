import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"

const initialState = {
  courseSectionData: [],
  courseEntireData: [],
  completedLectures: [],
  totalNoOfLectures: 0,
  courseDetails: null,
  courseDetailsLoading: false,
  courseDetailsLoaded: false,
}

// Thunk to fetch full course details with deduplication
export const fetchFullCourseDetails = createAsyncThunk(
  "viewCourse/fetchFullCourseDetails",
  async (courseId, { rejectWithValue }) => {
    try {
      const data = await getFullDetailsOfCourse(courseId)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  },
  {
    condition: (courseId, { getState }) => {
      const state = getState()
      if (!state || !state.viewCourse) return true
      const { courseDetailsLoading, courseDetailsLoaded, courseDetails } = state.viewCourse
      // If already loading or the requested course is already loaded, skip
      if (courseDetailsLoading) return false
      if (
        courseDetailsLoaded &&
        courseDetails &&
        courseDetails._doc &&
        courseDetails._doc._id === courseId
      )
        return false
      return true
    },
  }
)

const viewCourseSlice = createSlice({
  name: "viewCourse",
  initialState,
  reducers: {
    setCourseSectionData: (state, action) => {
      state.courseSectionData = action.payload
    },
    setEntireCourseData: (state, action) => {
      state.courseEntireData = action.payload
    },
    setTotalNoOfLectures: (state, action) => {
      state.totalNoOfLectures = action.payload
    },
    setCompletedLectures: (state, action) => {
      state.completedLectures = action.payload
    },
    updateCompletedLectures: (state, action) => {
      state.completedLectures = [...state.completedLectures, action.payload]
    },
    setCourseDetails: (state, action) => {
      state.courseDetails = action.payload
      state.courseDetailsLoaded = true
      state.courseDetailsLoading = false
    },
    setCourseDetailsLoading: (state, action) => {
      state.courseDetailsLoading = action.payload
    },
    resetCourseDetails: (state) => {
      state.courseDetails = null
      state.courseDetailsLoaded = false
      state.courseDetailsLoading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFullCourseDetails.pending, (state) => {
        state.courseDetailsLoading = true
      })
      .addCase(fetchFullCourseDetails.fulfilled, (state, action) => {
        state.courseDetails = action.payload
        state.courseDetailsLoaded = true
        state.courseDetailsLoading = false
      })
      .addCase(fetchFullCourseDetails.rejected, (state) => {
        state.courseDetailsLoading = false
      })
  },
})

export const {
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
  setCompletedLectures,
  updateCompletedLectures,
  setCourseDetails,
  setCourseDetailsLoading,
  resetCourseDetails,
} = viewCourseSlice.actions

export default viewCourseSlice.reducer