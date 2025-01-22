export function setSecureCookie(res, token) {
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  
    return res;
  }
  
