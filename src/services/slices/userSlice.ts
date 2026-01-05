import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginUserApi,
  registerUserApi,
  getUserApi,
  logoutApi,
  updateUserApi,
  forgotPasswordApi,
  resetPasswordApi
} from '@api';
import { TUser } from '@utils-types';
import { setCookie, getCookie, deleteCookie } from '../../utils/cookie';

// Локально определяем типы, так как они не экспортируются из types.ts
type TRegisterData = {
  email: string;
  name: string;
  password: string;
};

type TLoginData = {
  email: string;
  password: string;
};

// 1. Регистрация
export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const res = await registerUserApi(data);
    localStorage.setItem('refreshToken', res.refreshToken);
    setCookie('accessToken', res.accessToken);
    return res.user;
  }
);

// 2. Вход
export const loginUser = createAsyncThunk(
  'user/login',
  async (data: TLoginData, { rejectWithValue }) => {
    try {
      const res = await loginUserApi(data);
      localStorage.setItem('refreshToken', res.refreshToken);
      setCookie('accessToken', res.accessToken);
      return res.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// 3. Выход
export const logoutUser = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
});

// 4. Восстановление пароля
export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (email: string) => {
    await forgotPasswordApi({ email });
  }
);

// 5. Сброс пароля
export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async ({ password, token }: { password: string; token: string }) => {
    await resetPasswordApi({ password, token });
  }
);

// 6. Обновление профиля
export const updateUser = createAsyncThunk(
  'user/update',
  async (data: Partial<TRegisterData>) => {
    const res = await updateUserApi(data);
    return res.user;
  }
);

// 7. Проверка авторизации при загрузке (ИСПОЛЬЗУЕМ getCookie)
export const checkUserAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    // getCookie
    const refreshToken = localStorage.getItem('refreshToken');
    const accessToken = getCookie('accessToken');

    // Если нет токенов - сразу завершаем
    if (!refreshToken || !accessToken) {
      return rejectWithValue('No tokens found');
    }

    try {
      const res = await getUserApi();
      return res.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

interface IUserState {
  data: TUser | null;
  isAuthChecked: boolean;
  error: string | null;
}

const initialState: IUserState = {
  data: null,
  isAuthChecked: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // checkUserAuth
      .addCase(checkUserAuth.pending, (state) => {
        state.isAuthChecked = false;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.isAuthChecked = true;
        state.data = null;
      })

      // loginUser
      .addCase(loginUser.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка авторизации';
      })

      // registerUser
      .addCase(registerUser.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка регистрации';
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.data = null;
      })

      // updateUser
      .addCase(updateUser.fulfilled, (state, action) => {
        state.data = action.payload;
      })

      // forgotPassword и resetPassword
      .addCase(forgotPassword.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка восстановления пароля';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка сброса пароля';
      });
  }
});

export const { clearError } = userSlice.actions;
export default userSlice;
