export function setSecureCookie(res, token) {
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "None"
    });
  
    return res;
  }
  
