import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

import styles from './styles.module.scss';
import InputField from 'components/InputField';
import { Button, Divider, Space, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { usersThunk } from 'redux/thunks/usersThunk';
import { notifications } from 'utils/notifications';
import { storage } from 'utils/storage';
import { ACCESS_TOKEN, USER_LOGIN } from 'utils/constants/settingSystem';
import { history } from 'utils/history';

const SignInSchema = Yup.object().shape({
  email: Yup.string().required('Please provide email.'),
  password: Yup.string().required('Please provide password.'),
});

const SigninForm = () => {
  const dispatch = useDispatch();

  const { isLoadingUsers } = useSelector((state) => state.users);
  // Formik
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: SignInSchema,
    onSubmit: async (values) => {
      try {
        const response = await dispatch(usersThunk.signIn(values)).unwrap();
        storage.setStorageJson(USER_LOGIN, response);
        storage.setStorageJson(ACCESS_TOKEN, response.accessToken);
        storage.setCookieJson(USER_LOGIN, response, 30);
        notifications.success('Sign in successfully.');
        history.push('/index');
      } catch (err) {
        notifications.error('Failed to sign in.');
      }
    },
  });

  const responseFacebook = async (responseFB) => {
    try {
      const response = await dispatch(usersThunk.facebooklogin(responseFB?.accessToken)).unwrap();
      storage.setStorageJson(USER_LOGIN, response);
      storage.setStorageJson(ACCESS_TOKEN, response.accessToken);
      storage.setCookieJson(USER_LOGIN, response, 30);
      notifications.success('Sign in with Facebook successfully.');
      history.push('/index');
    } catch (err) {
      notifications.error('Failed to sign in with Facebook.');
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit}>
        <InputField
          label='Email'
          name='email'
          value={values.email}
          error={errors.email}
          touched={touched.email}
          placeholder='Insert email'
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <Divider />
        <InputField
          label='Password'
          name='password'
          value={values.password}
          error={errors.password}
          touched={touched.password}
          placeholder='Insert password'
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <Divider />
        <Space>
          <Button
            type='primary'
            htmlType='submit'
          >
            Sign In
          </Button>
          <FacebookLogin
            appId='259894119932234'
            autoLoad={false}
            fields='name,email,picture'
            callback={responseFacebook}
            render={(renderProps) => (
              <Button
                type='primary'
                disabled={isLoadingUsers}
                onClick={renderProps.onClick}
              >
                <Space>
                  Sign in with Facebook
                  <Spin
                    spinning={isLoadingUsers}
                    style={{ color: '#fff' }}
                  />
                </Space>
              </Button>
            )}
          />
        </Space>
      </form>
    </div>
  );
};

export default SigninForm;
