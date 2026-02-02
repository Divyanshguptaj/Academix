import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { fetchCourseCategories } from "../services/operations/courseDetailsAPI"

const initialState = {
  step: 1,
  course: null,
  editCourse: false,
  paymentLoading: false,
  categories: [],
  categoriesLoading: false,
  categoriesLoaded: false,
}

// Thunk to fetch categories with deduplication
export const fetchCategories = createAsyncThunk(
  "course/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const categories = await fetchCourseCategories()
      return categories
    } catch (err) {
      return rejectWithValue(err)
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState()
      if (!state || !state.course) return true
      const { categoriesLoading, categoriesLoaded } = state.course
      if (categoriesLoading) return false
      if (categoriesLoaded) return false
      return true
    },
  }
)

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.step = action.payload
    },
    setCourse: (state, action) => {
      state.course = action.payload
    },
    setEditCourse: (state, action) => {
      state.editCourse = action.payload
    },
    setPaymentLoading: (state, action) => {
      state.paymentLoading = action.payload
    },
    resetCourseState: (state) => {
      state.step = 1
      state.course = null
      state.editCourse = false
    },
    setCategories: (state, action) => {
      state.categories = action.payload
      state.categoriesLoaded = true
      state.categoriesLoading = false
    },
    setCategoriesLoading: (state, action) => {
      state.categoriesLoading = action.payload
    },
    resetCategories: (state) => {
      state.categories = []
      state.categoriesLoaded = false
      state.categoriesLoading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
        state.categoriesLoaded = true
        state.categoriesLoading = false
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesLoading = false
      })
  },
})

export const {
  setStep,
  setCourse,
  setEditCourse,
  setPaymentLoading,
  resetCourseState,
  setCategories,
  setCategoriesLoading,
  resetCategories,
} = courseSlice.actions

export default courseSlice.reducer