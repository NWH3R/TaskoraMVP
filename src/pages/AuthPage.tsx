@@ .. @@
 import React, { useState } from 'react';
-import { useNavigate } from 'react-router-dom';
+import { useNavigate, useLocation } from 'react-router-dom';
 import { motion, AnimatePresence } from 'framer-motion';
@@ .. @@
 export const AuthPage: React.FC = () => {
   const { signUp, signIn, signInWithGoogle } = useAuth();
   const navigate = useNavigate();
+  const location = useLocation();
   const [loading, setLoading] = useState(false);
-  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
+  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(
+    location.pathname === '/signup' ? 'signup' : 'login'
+  );
   const [showPassword, setShowPassword] = useState(false);
@@ .. @@
     try {
       if (activeTab === 'signup') {
         await signUp(formData.email, formData.password, formData.fullName);
+        navigate('/dashboard', { replace: true });
       } else {
         await signIn(formData.email, formData.password);
+        navigate('/dashboard', { replace: true });
       }
-      navigate('/dashboard', { replace: true });
     } catch (error) {
       // Error is handled by the auth context
     } finally {
@@ .. @@
   const handleGoogleSignIn = async () => {
     try {
       await signInWithGoogle();
+      // Navigation is handled by the auth context
     } catch (error) {
       // Error is handled by the auth context
     }
   };