"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import "./create.css";
import {
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

export default function CreateProfile() {
  const { username } = useParams<{ username: string }>();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    uid: "",
    name: "",
    bio: "",
  });
  const [links, setLinks] = useState([{ id: 0, name: "", url: "" }]);
  const [idCounter, setIdCounter] = useState(1);

  useEffect(() => {
    async function fetchUserData() {
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
  }

  async function getUserDetails(username: string): Promise<UserDetails | null> {
    const { data, error } = await supabase
      .from("users")
      .select("uid, name, bio")
      .eq("id", username)
      .single();

    if (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
    return data;
  }

  const addLink = () => {
    setLinks([...links, { id: idCounter, name: "", url: "" }]);
    setIdCounter(idCounter + 1);
  };

  const updateLink = (id: number, name: string, url: string) => {
    setLinks(
      links.map((link) => (link.id === id ? { ...link, name, url } : link))
    );
  };

  const removeLink = (id: number) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const saveLinksToSupabase = async () => {
    if (!userData.uid) return;

    const formattedLinks = links.reduce((acc, { name, url }) => {
      if (name.trim() && url.trim()) acc[name] = { url };
      return acc;
    }, {} as Record<string, { url: string }>);

    const { error } = await supabase
      .from("users")
      .update({ links: formattedLinks })
      .eq("uid", userData.uid);

    if (error) console.error("Error saving links:", error);
    else console.log("Links saved successfully:", formattedLinks);
  };

  if (!isAuthorized) return <>Loading... (authorization unsuccessful)</>;

  return (
    <div className="home">
      <div className="nav">
        <div className="textBig">hellolink</div>
      </div>
      <div className="main">
        <div className="top">
          <div className="pfp"></div>
          <div className="name">{userData.name}</div>
          <div className="bio">
            {userData.bio || "Write a short bio about yourself."}
          </div>
          <div className="socials">
            {[Github, Dribbble, Linkedin, CodepenIcon].map((Icon, idx) => (
              <div key={idx} className="item">
                <Icon />
              </div>
            ))}
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
                <DynamicLink
                  key={link.id}
                  link={link}
                  updateLink={updateLink}
                  removeLink={removeLink}
                />
              ))}
            </div>
            <div className="addLink" onClick={addLink}>
              <Plus size={45} />
            </div>
            <div className="saveLink" onClick={saveLinksToSupabase}>
              <Save size={26} /> Save Links
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DynamicLink({
  link,
  updateLink,
  removeLink,
}: {
  link: { id: number; name: string; url: string };
  updateLink: (id: number, name: string, url: string) => void;
  removeLink: (id: number) => void;
}) {
  const logoRef = useRef<NodeJS.Timeout | null>(null);
  const [logoValue, setLogoValue] = useState(link.name || "410dev");

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    updateLink(link.id, link.name, newUrl);

    if (logoRef.current) clearTimeout(logoRef.current);
    logoRef.current = setTimeout(() => {
      setLogoValue(newUrl);
    }, 500);
  };

  return (
    <div className="link">
      <div className="logo">
        <Avvvatars value={logoValue || "410dev"} style="shape" size={55} />
      </div>
      <div className="input">
        <input
          type="text"
          placeholder="Name"
          value={link.name}
          onChange={(e) => updateLink(link.id, e.target.value, link.url)}
        />
        <div className="seperator"></div>
        <input
          type="text"
          placeholder="Link"
          value={link.url}
          onChange={handleUrlChange}
        />
      </div>
      <div className="enter" onClick={() => removeLink(link.id)}>
        <Trash2 size={26} />
      </div>
    </div>
  );
}
