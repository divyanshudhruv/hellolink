"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import "./show.css";
import "./../../styles/errorPage.css";
import {
  ArrowRight,
  CodepenIcon,
  Dribbble,
  Github,
  Linkedin,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Avvvatars from "avvvatars-react";
import { supabase } from "@/config/supabase";
import { User } from "@supabase/supabase-js";

export default function ShowProfile() {
  const [userSession, setUserSession] = useState<User | null>(null);
  const [socials, setSocials] = useState({
    github: "",
    dribbble: "",
    linkedin: "",
    codepen: "",
  });

  useEffect(() => {
    const fetchUserAndSocials = async () => {
      // Step 1: Get user session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        return;
      }

      const user = sessionData?.session?.user;
      if (!user) {
        console.error("User session not found.");
        return;
      }

      setUserSession(user); // Store user session

      // Step 2: Fetch social links from database
      const { data: socialsData, error: socialsError } = await supabase
        .from("users")
        .select("socials")
        .eq("uid", user.id)
        .single();

      if (socialsError) {
        console.error("Error fetching socials:", socialsError);
        return;
      }

      if (socialsData?.socials) {
        setSocials({
          github: socialsData.socials.github || "",
          dribbble: socialsData.socials.dribbble || "",
          linkedin: socialsData.socials.linkedin || "",
          codepen: socialsData.socials.codepen || "",
        });
      }
    };

    fetchUserAndSocials();
  }, []);

  const { username } = useParams() as unknown as { username: string };

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    uid: "",
    name: "",
    bio: "",
  });

  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [idCounter, setIdCounter] = useState(1);

  useEffect(() => {
    async function fetchUserData() {
      if (typeof username !== "string") {
        console.error("Invalid username parameter");
        return;
      }
      const userId = await getCurrentUserId();
      const userDetails = await getUserDetails(username);

      setUserData({
        id: userId || "",
        uid: userDetails?.uid || "",
        name: userDetails?.name || "",
        bio: userDetails?.bio || "",
      });

      if (userDetails?.uid === userId) {
        setIsAuthorized(true);
        fetchLinks(userDetails.uid);
      }
    }
    fetchUserData();
  }, [username]);

  async function getCurrentUserId() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) console.error("Error fetching session:", error);
    return session?.user?.id || null;
  }

  interface UserDetails {
    uid: string;
    name: string;
    bio: string;
    links?: { [key: string]: { url: string } };
  }

  async function getUserDetails(username: string): Promise<UserDetails | null> {
    const { data, error } = await supabase
      .from("users")
      .select("uid, name, bio, links")
      .eq("name", username)
      .single();

    if (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
    return data;
  }

  interface UserLinks {
    [key: string]: { url: string };
  }

  interface LinkEntry {
    id: number;
    name: string;
    url: string;
  }

  async function fetchLinks(uid: string) {
    const { data, error } = await supabase
      .from("users")
      .select("links")
      .eq("uid", uid)
      .single();

    if (error) {
      console.error("Error fetching links:", error);
      return;
    }

    // Ensure links are loaded in the same order
    const savedLinks = Array.isArray(data?.links)
      ? data.links.map((link, index) => ({ id: index + 1, ...link }))
      : [];

    setLinks(savedLinks);
    setIdCounter(savedLinks.length + 1);
  }

  function UserNotFound() {
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowNotFound(true);
      }, 3000);
      return () => clearTimeout(timer);
    }, []);

    const [showNotFound, setShowNotFound] = useState(false);

    return showNotFound ? <>USER NOT FOUND ;-;</> : null;
  }

  if (!isAuthorized)
    return (
      <>
        <div className="error">
          Loading(checking auth)...
          <br />
          <UserNotFound />
        </div>
      </>
    );

  return (
    <>
      <div className="home">
        <div className="nav">
          <div className="textBig" onClick={() => (window.location.href = "/")}>
            hellolink
          </div>
          <div className="button" onClick={() => (window.location.href = "/")}>
            Get your's !
          </div>
        </div>
        <div className="main">
          <div className="top">
            <div className="pfp">
              <Avvvatars
                value="devvve235224wqqwrtete"
                style="shape"
                size={100}
              />
            </div>
            <div className="name">@{userData.name}</div>
            <div className="bio">
              {userData.bio || "Write a short bio about yourself."}
            </div>
            <div className="socials">
              <div
                className="item"
                onClick={() => window.open(socials.github, "_blank")}
              >
                <Github />
              </div>
              <div
                className="item"
                onClick={() => window.open(socials.dribbble, "_blank")}
              >
                <Dribbble />
              </div>
              <div
                className="item"
                onClick={() => window.open(socials.linkedin, "_blank")}
              >
                <Linkedin />
              </div>
              <div
                className="item"
                onClick={() => window.open(socials.codepen, "_blank")}
              >
                <CodepenIcon />
              </div>
            </div>
          </div>
          <div className="bottom">
            <div className="textTop">Featured Links</div>
            <div className="linkC">
              <div
                className="linkContainer"
                style={{
                  width: "100%",
                  gap: "20px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {links.map((link) => (
                  <DynamicLink key={link.id} link={link} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DynamicLink({
  link,
}: {
  link: { id: number; name: string; url: string };
}) {
  const logoRef = useRef<number | null>(null);
  const [logoValue, setLogoValue] = useState(link.name || "410dev");

  return (
    <div className="link">
      <div className="logo">
        <Avvvatars value={logoValue} style="shape" size={55} />
      </div>
      <div className="input">{link.name}</div>
      <div className="enter" onClick={() => window.open(link.url, "_blank")}>
        <ArrowRight />
      </div>
    </div>
  );
}
