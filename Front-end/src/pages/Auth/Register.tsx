import React from 'react';
import { Form, Input, Button, Typography, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { GoogleOutlined } from '@ant-design/icons';
import './Register.css';
// import illustration from '../../assets/images/auth/register-illustration.png'; // Placeholder image

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
    // Here you will call your API service: authService.register(values)
  };

  return (
    <Row className="register-container" align="middle">
      {/* LEFT SIDE: The Form */}
      <Col xs={24} md={12} className="register-form-col">
        <div className="form-content">
          <Title level={2} className="form-title">Sign Up</Title>
          <Text className="form-subtitle">Enter your details to create your account</Text>

          <Button className="google-signup-btn" icon={<GoogleOutlined />}>
            Sign up with Google
          </Button>

          <div className="separator">
            <span className="separator-text">or</span>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="prenom"
                  label={<span className="form-label">First Name</span>}
                  rules={[{ required: true, message: 'Please enter your first name' }]}
                >
                  <Input placeholder="First Name" size="large" className="form-input" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="nom"
                  label={<span className="form-label">Last Name</span>}
                  rules={[{ required: true, message: 'Please enter your last name' }]}
                >
                  <Input placeholder="Last Name" size="large" className="form-input" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label={<span className="form-label">Email</span>}
              rules={[
                { type: 'email', message: 'The input is not valid E-mail!' },
                { required: true, message: 'Please enter your email' },
              ]}
            >
              <Input placeholder="mail@example.com" size="large" className="form-input" />
            </Form.Item>

            <Form.Item
              name="mot_de_passe"
              label={<span className="form-label">Password</span>}
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                placeholder="Min. 8 characters"
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block className="submit-btn">
                Sign Up
              </Button>
            </Form.Item>

            <div className="form-footer">
              <Text className="footer-text">Already have an account?</Text>
              <Link to="/login" className="login-link">
                Sign In
              </Link>
            </div>
          </Form>
        </div>
      </Col>

      {/* RIGHT SIDE: The Illustration */}
      <Col xs={0} md={12} className="register-graphic-col">
        <div className="graphic-content">
          <div className="brand-logo">
            {/* Replace with your actual logo/text */}
            <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>SYNDIC PRO</span>
          </div>
          
          <div className="illustration-wrapper">
            <img src={"#"} alt="Register Illustration" className="illustration-image" />
          </div>

          <div className="graphic-text">
            <Title level={3} className="graphic-title">
              Manage Your Property with Ease
            </Title>
            <Text className="graphic-description">
              Streamline your syndic management, track payments, and connect with owners all in one place.
            </Text>
          </div>
          
          {/* Navigation Dots (Visual only) */}
          <div className="nav-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Register;