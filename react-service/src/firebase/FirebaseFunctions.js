import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
} from "firebase/auth";

async function doPasswordReset(email) {
  await sendPasswordResetEmail(email);
}

async function doPasswordUpdate(password) {
  await updatePassword(password);
}

async function doSignOut() {
  await signOut();
}

async function doChangePassword(email, oldPassword, newPassword) {
  let credential = EmailAuthProvider.credential(email, oldPassword);
  await reauthenticateWithCredential(credential);
  await updatePassword(newPassword);
  await doSignOut();
}

export {
  doPasswordReset,
  doPasswordUpdate,
  doSignOut,
  doChangePassword,
};
