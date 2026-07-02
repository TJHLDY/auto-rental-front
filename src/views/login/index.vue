<template>
  <div class="login-wrapper">
    <!-- 背景道路线条动画 -->
    <div class="bg-road bg-road--fast" />
    <div class="bg-road bg-road--mid" />
    <div class="bg-road bg-road--slow" />

    <!-- 装饰性速度表弧线 -->
    <div class="decor-arc" />

    <!-- 散落的光点 -->
    <div class="decor-dots" />

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-card__edge" />

      <div class="login-card__body">
        <!-- 品牌标识区 -->
        <div class="brand">
          <svg class="brand__emblem" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="21" stroke="currentColor" stroke-width="1.2" opacity="0.5" />
            <circle cx="24" cy="24" r="7" stroke="currentColor" stroke-width="1.5" />
            <path d="M24 3v14M24 31v14M3 24h14M31 24h14" stroke="currentColor" stroke-width="1.5" />
            <circle cx="24" cy="24" r="2" fill="currentColor" />
          </svg>
          <h1 class="brand__title">汽车租聘管理系统</h1>
          <p class="brand__subtitle">AUTO RENTAL MANAGEMENT SYSTEM</p>
          <div class="brand__divider" />
        </div>

        <!-- 表单 -->
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          autocomplete="on"
          label-position="left"
        >
          <el-form-item prop="username">
            <span class="input-icon">
              <svg-icon icon-class="user" />
            </span>
            <el-input
              ref="username"
              v-model="loginForm.username"
              placeholder="登陆账号"
              name="username"
              type="text"
              tabindex="1"
              autocomplete="on"
            />
          </el-form-item>

          <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
            <el-form-item prop="password">
              <span class="input-icon">
                <svg-icon icon-class="password" />
              </span>
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="登陆密码"
                name="password"
                tabindex="2"
                autocomplete="on"
                @keyup.native="checkCapslock"
                @blur="capsTooltip = false"
                @keyup.enter.native="handleLogin"
              />
              <span class="toggle-pwd" @click="showPwd">
                <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
              </span>
            </el-form-item>
          </el-tooltip>

          <el-button
            :loading="loading"
            class="login-btn"
            @click.native.prevent="handleLogin"
          >
            <span class="login-btn__text">登 录</span>
          </el-button>
        </el-form>
      </div>
    </div>

    <!-- 第三方登录弹窗 -->
    <el-dialog title="Or connect with" :visible.sync="showDialog">
      Can not be simulated on local, so please combine you own business simulation! ! !
      <br />
      <br />
      <br />
      <social-sign />
    </el-dialog>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import SocialSign from './components/SocialSignin'

export default {
  name: 'Login',
  components: { SocialSign },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 4) {
        callback(new Error('The password can not be less than 4 digits'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: 'admin',
        password: 'admin'
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch(err => {
              this.loading = false
              this.$message.error('账号或密码错误')
            })
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
/* ===== Element UI 全局覆写 ===== */

$bg-dark: #0d0d16;
$gold: #c4a45a;
$gold-light: #d4bc7a;
$text-light: #e0dbd0;
$text-muted: #6b6b78;

@supports (-webkit-mask: none) and (not (cater-color: $gold)) {
  .login-wrapper .el-input input {
    color: $text-light;
  }
}

.login-wrapper {
  .el-input {
    display: inline-block;
    height: 48px;
    width: 85%;

    input {
      background: transparent;
      border: none;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 5px 12px 0;
      color: $text-light;
      height: 48px;
      font-size: 15px;
      caret-color: $gold;
      letter-spacing: 1px;

      &::placeholder {
        color: $text-muted;
        letter-spacing: 1px;
      }

      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px #14141f inset !important;
        -webkit-text-fill-color: $text-light !important;
        caret-color: $gold !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #14141f;
    border-radius: 2px;
    transition: border-color 0.35s ease;
    margin-bottom: 24px;

    &:focus-within {
      border-color: rgba(196, 164, 90, 0.45);
    }
  }

  .el-form-item__error {
    color: #d4735a;
    font-size: 12px;
    letter-spacing: 0.5px;
    padding-top: 4px;
  }

  .el-tooltip__popper {
    font-size: 12px;
    letter-spacing: 0.5px;
  }
}
</style>

<style lang="scss" scoped>
/* ===== 设计变量 ===== */
$bg-deep: #0d0d16;
$bg-card: #12121d;
$gold: #c4a45a;
$gold-light: #d4bc7a;
$gold-glow: rgba(196, 164, 90, 0.25);
$text-primary: #e0dbd0;
$text-muted: #6b6b78;
$text-dim: #4a4a55;
$border-card: rgba(255, 255, 255, 0.06);

/* ===== 容器 & 背景 ===== */
.login-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: $bg-deep;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

/* ---- 背景道路线条动画 ---- */
.bg-road {
  position: absolute;
  inset: -50%;
  pointer-events: none;
  opacity: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      118deg,
      transparent,
      transparent 1px,
      rgba(255, 255, 255, 0.018) 1px,
      rgba(255, 255, 255, 0.018) 5px
    );
    animation: roadShift 20s linear infinite;
  }

  &--fast::before {
    background: repeating-linear-gradient(
      118deg,
      transparent,
      transparent 1px,
      rgba(255, 255, 255, 0.025) 1px,
      rgba(255, 255, 255, 0.025) 3px
    );
    animation-duration: 12s;
  }

  &--mid::before {
    background: repeating-linear-gradient(
      118deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.016) 2px,
      rgba(255, 255, 255, 0.016) 8px
    );
    animation-duration: 25s;
  }

  &--slow::before {
    background: repeating-linear-gradient(
      118deg,
      transparent,
      transparent 3px,
      rgba(255, 255, 255, 0.011) 3px,
      rgba(255, 255, 255, 0.011) 14px
    );
    animation-duration: 40s;
  }
}

@keyframes roadShift {
  from { transform: translate(0, 0); }
  to   { transform: translate(120px, 60px); }
}

/* ---- 装饰性速度表弧线 ---- */
.decor-arc {
  position: absolute;
  top: -180px;
  right: -120px;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  border: 1.5px solid rgba(196, 164, 90, 0.15);
  pointer-events: none;
  animation: arcPulse 4s ease-in-out infinite;

  &::after {
    content: '';
    position: absolute;
    top: 30px;
    right: 30px;
    width: 440px;
    height: 440px;
    border-radius: 50%;
    border: 1px solid rgba(196, 164, 90, 0.08);
  }
}

@keyframes arcPulse {
  0%, 100% { border-color: rgba(196, 164, 90, 0.12); }
  50%      { border-color: rgba(196, 164, 90, 0.22); }
}

/* ---- 散落光点 ---- */
.decor-dots {
  position: absolute;
  top: 18%;
  right: 8%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(196, 164, 90, 0.5);
  pointer-events: none;
  box-shadow:
    30px 10px 0 rgba(196, 164, 90, 0.3),
    -20px 40px 0 rgba(196, 164, 90, 0.2),
    60px 60px 0 rgba(196, 164, 90, 0.15),
    90px 15px 0 rgba(196, 164, 90, 0.25),
    -40px 80px 0 rgba(196, 164, 90, 0.18),
    15px 100px 0 rgba(196, 164, 90, 0.12);
  animation: dotsFloat 6s ease-in-out infinite;
}

@keyframes dotsFloat {
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50%      { transform: translateY(-8px); opacity: 1; }
}

/* ===== 登录卡片 ===== */
.login-card {
  position: relative;
  width: 440px;
  max-width: 92vw;
  display: flex;
  animation: cardEnter 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片左侧金色装饰条 */
.login-card__edge {
  flex-shrink: 0;
  width: 3px;
  background: linear-gradient(180deg, transparent, $gold 20%, $gold 80%, transparent);
  border-radius: 2px;
  margin-right: 0;
  opacity: 0.7;
}

/* 卡片主体 */
.login-card__body {
  flex: 1;
  background: $bg-card;
  border: 1px solid $border-card;
  border-left: none;
  padding: 52px 44px 44px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(196, 164, 90, 0.04) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 100%, rgba(196, 164, 90, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }
}

/* ===== 品牌标识区 ===== */
.brand {
  text-align: center;
  margin-bottom: 40px;
  animation: brandEnter 0.6s 0.15s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

@keyframes brandEnter {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.brand__emblem {
  width: 52px;
  height: 52px;
  color: $gold;
  margin-bottom: 20px;
  opacity: 0.85;
  animation: emblemSpin 20s linear infinite;
}

@keyframes emblemSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.brand__title {
  font-size: 26px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 8px;
  letter-spacing: 4px;
}

.brand__subtitle {
  font-size: 11px;
  font-weight: 400;
  color: $text-dim;
  letter-spacing: 5px;
  margin: 0;
  text-transform: uppercase;
}

.brand__divider {
  width: 40px;
  height: 2px;
  background: $gold;
  margin: 20px auto 0;
  opacity: 0.6;
  border-radius: 1px;
}

/* ===== 表单 ===== */
.login-form {
  animation: formEnter 0.6s 0.3s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

@keyframes formEnter {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.input-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 48px;
  color: $text-muted;
  font-size: 18px;
  vertical-align: middle;
}

.toggle-pwd {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: $text-muted;
  cursor: pointer;
  transition: color 0.25s;
  user-select: none;

  &:hover {
    color: $gold;
  }
}

/* ===== 登录按钮 ===== */
.login-btn {
  width: 100%;
  height: 50px;
  border: none;
  background: linear-gradient(135deg, #b8923e, $gold, #b8923e);
  background-size: 200% 100%;
  color: #0d0d16;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  transition: all 0.35s ease;
  margin-top: 8px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }

  &:hover {
    background-position: 100% 0;
    box-shadow: 0 6px 28px $gold-glow;
    transform: translateY(-1px);
    letter-spacing: 12px;

    &::before {
      transform: translateX(100%);
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px $gold-glow;
  }

  &.is-loading {
    background: #1e1e2c;
    border: 1px solid rgba(196, 164, 90, 0.3);
    pointer-events: none;

    .login-btn__text {
      opacity: 0;
    }
  }
}

.login-btn__text {
  position: relative;
  z-index: 1;
  transition: opacity 0.2s;
}

/* 按钮 loading 动画 */
.login-btn.is-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  margin: -11px 0 0 -11px;
  border: 2px solid rgba(196, 164, 90, 0.3);
  border-top-color: $gold;
  border-radius: 50%;
  animation: btnSpin 0.7s linear infinite;
}

@keyframes btnSpin {
  to { transform: rotate(360deg); }
}

/* ===== 响应式 ===== */
@media only screen and (max-width: 520px) {
  .login-card {
    width: 92vw;
  }

  .login-card__body {
    padding: 40px 24px 32px;
  }

  .brand__title {
    font-size: 22px;
    letter-spacing: 2px;
  }

  .brand__subtitle {
    font-size: 10px;
    letter-spacing: 3px;
  }

  .login-btn {
    letter-spacing: 6px;

    &:hover {
      letter-spacing: 8px;
    }
  }

  .decor-arc {
    top: -240px;
    right: -200px;
    width: 360px;
    height: 360px;
  }
}

@media only screen and (max-height: 620px) {
  .login-card__body {
    padding: 28px 36px 28px;
  }

  .brand {
    margin-bottom: 24px;
  }

  .brand__emblem {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
  }

  .brand__title {
    font-size: 22px;
  }

  .brand__divider {
    margin-top: 14px;
  }
}
</style>
