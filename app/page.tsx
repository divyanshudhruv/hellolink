"use client";
import "./style.css";
import Avvvatars from "avvvatars-react";
import { supabase } from "@/config/supabase";
import { InstagramIcon } from "@/components/ui/instagram";
import { ArrowRight, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { toast } from "sonner";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUpNewUser() {
    if (!username || !password) {
      alert("Username and password are required!");
      return;
    }

    const usernameFinal = `${username}@nexoq.me`;
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: usernameFinal,
      password: password,
      options: {
        data: {
          display_name: username,
        },
      },
    });

    if (error) {
      console.error("Signup error:", error.message);
    } else {
      const user = data.user;
      if (user) {
        const { error: insertError } = await supabase.from("users").insert([
          {
            uid: user.id, // Supabase Auth ID
            name: username,
            password: password,
            profile_pic: "", // Default empty or set a default image URL from Supabase Storage
            bio: "",
            links: [],
            socials: [],
          },
        ]);

        if (insertError) {
          console.error("Error inserting user data:", insertError.message);
        } else {
          console.log("User added to database successfully!");
        }
      }
    }

    setLoading(false);

    if (error) {
      alert("Signup failed: " + error.message);
      console.error(error);
    } else {
      toast("Signed up successfully", {
        description: `Login to continue...`,
        action: {
          label: "Okay",
          onClick: () => console.log("Undo"),
        },
      });

      setTimeout(() => {
        window.location.href = "/#signup";
        const usernameInput = document.getElementById(
          "username"
        ) as HTMLInputElement;
        if (usernameInput) usernameInput.value = "";
        const passwordInput = document.getElementById(
          "password"
        ) as HTMLInputElement;
        if (passwordInput) passwordInput.value = "";
      }, 1500);
    }
  }

  async function signInUser() {
    if (!username || !password) {
      alert("Username and password are required!");
      return;
    }

    const usernameFinal = `${username}@nexoq.me`;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: usernameFinal,
      password: password,
    });

    if (error) {
      setLoading(false);
      alert("Login failed: " + error.message);
      console.error(error);
      return;
    }

    toast("Logged in successfully", {
      description: `Redirecting in 3 seconds...`,
      action: {
        label: "Okay",
        onClick: () => console.log("Undo"),
      },
    });
    async function getCurrentUserId() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        console.error("Error fetching authenticated user:", authError.message);
        return null;
      }

      const uid = authData?.user?.id;
      if (!uid) return null;

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("uid", uid)
        .single();

      if (userError) {
        console.error(
          "Error fetching user ID from database:",
          userError.message
        );
        return null;
      }

      return userData?.id || null;
    }
    const userId = await getCurrentUserId();

    setTimeout(() => {
      window.location.href = `/create/${userId}`;
    }, 3000);

    setLoading(false);
  }

  useEffect(() => {
    checkSessionAndNotify();
  }, []);

  return (
    <>
      <Toaster />
      {loading && <div>Loading...</div>}
      <div className="container">
        <div className="nav">
          <div className="leftC">
            <div className="logo">
              {" "}
              <Avvvatars
                style="shape"
                value="hello 32link124567153fgdfy35ey"
                size={60}
              />
            </div>
            <div className="linkContainer">
              <a href="#">
                <div className="link">Home</div>
              </a>
              <a href="#signup">
                <div className="link">Create</div>
              </a>
              <a onClick={goToDashboard}>
                <div className="link">Dashboard</div>
              </a>
              <a href="https://git.new/hellolink" target="_blank">
                <div className="link">Contribute</div>
              </a>
            </div>
          </div>
          <div className="rightC">
            {" "}
            <div className="buttonContainer">
              <a href="#signup">
                <div className="button">Try it out</div>
              </a>
            </div>
          </div>
        </div>
        <div className="home">
          <div className="textBig">hellolink</div>
          <div className="textSmall">
            Tired of messy bios? Say hello to a single, powerful link that
            organizes and shares everything you love in one place.{" "}
          </div>
          <a href="#signup">
            <div className="button">Grab your username now</div>
          </a>
        </div>
        <div className="feature">
          <div className="box">
            <div className="top">
              <div className="code1">hellolink/username</div>
            </div>
            <div className="bottom">
              Get a short, shareable link for a clean online identity.
            </div>
          </div>
          <div className="box">
            {" "}
            <div className="top">
              <div className="containerFull">
                <div className="code">
                  <div className="line"></div>
                </div>
                <div className="code">
                  <div className="line"></div>
                </div>
                <div className="code">
                  <div className="line"></div>
                </div>
              </div>
            </div>
            <div className="bottom">
              One sleek layout that adapts beautifully to all users.
            </div>
          </div>
          <div className="box">
            {" "}
            <div className="top">
              <div className="containerFull">
                <div className="instagramSquare">
                  <div className="icon">
                    <InstagramIcon />
                  </div>
                  <div className="text1"></div>
                  <div className="text2"></div>
                </div>
              </div>
            </div>
            <div className="bottom">
              Add instant actions for WhatsApp, email, or DMs.
            </div>
          </div>
        </div>
        <div id="signup"></div>
        <div className="signup">
          <div className="left">
            <div className="box">
              <div className="textTop">Sign up and share!</div>
              <div className="textBottom">
                Join HelloLink and create your personalized link page in
                seconds. Share all your important links with a single, sleek
                profile. Sign up now—it&apos;s quick, easy, and free!
              </div>
            </div>
          </div>
          <div className="right">
            <div className="box">
              <div className="header">
                <div className="pfp">
                  <div>
                    <Avvvatars value="Div803nf" style="shape" size={60} />
                  </div>
                </div>
                <div className="text">hellolink/{username}</div>
              </div>
              <input
                type="text"
                placeholder="username"
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                maxLength={15}
                spellCheck={false}
              />
              <input
                type="password"
                placeholder="password"
                id="password"
                spellCheck={false}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div
                className="buttonSignUp"
                id="buttonSignUp"
                onClick={signUpNewUser}
              >
                Sign up&nbsp;&nbsp;
                <ArrowRight size={23} />
              </div>
              <div
                className="buttonSignIn"
                id="buttonSignUp"
                onClick={signInUser}
              >
                <LogIn size={23} />
              </div>
            </div>
          </div>
        </div>
        <div className="footer">
          <div className="left">
            <div className="top">
              <div className="textTop">hellolink</div>
              <div className="buttonC">
                <a href="#signup">
                  <div className="button1">Try now</div>
                </a>
                <div className="button2">
                  {" "}
                  <a href="https://git.new/hellolink" target="_blank">
                    Contribute
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="right">
            <div className="box">© 2025 HelloLink. All rights reserved.</div>
          </div>
        </div>
        <div className="lastLine">
          made with bugs by{" "}
          <u>
            <a href="https://git.new/divyanshudhruv" target="_blank">
              @divyanshudhruv
            </a>
          </u>
        </div>
      </div>
    </>
  );
}
async function checkSessionAndNotify() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error);
    return;
  }

  if (!session?.user?.id) {
    console.log("No active session found.");
    return;
  }

  const sessionID = session.user.id;
  const userEmail = session.user.email;

  // Fetch user's 'id' from Supabase database
  const { data, error: userError } = await supabase
    .from("users")
    .select("id") // Selecting the 'id' column
    .eq("uid", sessionID) // Matching the 'uid' field with session ID
    .single();

  if (userError || !data) {
    console.error("Error fetching user ID from database:", userError);
    return;
  }

  const userId = data.id;
  console.log("Fetched user ID from database:", userId);

  // Extract username from email
  const username = userEmail?.substring(0, userEmail.indexOf("@"));

  // Show success toast and redirect
  toast("Signed up successfully", {
    description: `User is already logged in.`,
    action: {
      label: "Dashboard",
      onClick: () => (window.location.href = `/create/${userId}`),
    },
  });
}

async function goToDashboard() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error);
    return;
  }

  if (!session?.user?.id) {
    console.log("No active session found.");
    return;
  }
  const sessionID = session.user.id;

  // Fetch user's 'id' from Supabase database
  const { data, error: userError } = await supabase
    .from("users")
    .select("id") // Selecting the 'id' column
    .eq("uid", sessionID) // Matching the 'uid' field with session ID
    .single();
  const userId = data?.id;

  if (userError || !data) {
    console.error("Error fetching user ID from database:", userError);
  } else {
    window.location.href = `/create/${userId}`;
  }
}
