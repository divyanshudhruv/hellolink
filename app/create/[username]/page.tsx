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
  const [booleanAuth, setBooleanAuth] = useState(false);
  const { username } = useParams<{ username: string }>();
  const [finalUserID, setFinalUserID] = useState("");
  const [finalFetchedUserID, setFinalFetchedUserID] = useState("");
  const [nameFinal, setNameFinal] = useState("");
  const [bioFinal, setBioFinal] = useState("");
  useEffect(() => {
    async function fetchUserIds() {
      const userId = await getUserId();
      const userUid = await getUserUid(username);
      setFinalUserID(userId || "");
      setFinalFetchedUserID(userUid || "");

      setNameFinal((await getUserName(username)) || "");
      setBioFinal((await getUserBio(username)) || "");

      if (userUid === userId) {
        console.log("User ID and UID are the same.");
        setBooleanAuth(true);
      }
    }
    fetchUserIds();
  }, [username]);

  const getUserName = async (username: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("name")
      .eq("id", username)
      .single();

    if (error) {
      console.error("Error fetching name:", error);
      return null;
    }
    return data?.name; // Correctly return the name
  };

  const getUserBio = async (username: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("bio")
      .eq("id", username)
      .single();

    if (error) {
      console.error("Error fetching name:", error);
      return null;
    }
    return data?.bio; // Correctly return the name
  };

  const getUserUid = async (username: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("uid")
      .eq("id", username)
      .single();

    if (error) {
      console.error("Error fetching UID:", error);
      return null;
    }

    const idFinal = data?.uid;
    return idFinal;
  };

  const getUserId = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error fetching session:", error);
      return null;
    }

    if (session?.user) {
      return session.user.id;
    } else {
      console.log("No active session found.");
      return null;
    }
  };

  const [links, setLinks] = useState<
    { id: number; name: string; url: string }[]
  >([{ id: 0, name: "", url: "" }]);
  const [idCounter, setIdCounter] = useState(1);

  const addLink = () => {
    setLinks([...links, { id: idCounter, name: "", url: "" }]);
    setIdCounter(idCounter + 1);
  };

  const updateLink = (id: number, name: string, url: string) => {
    setLinks((prevLinks) =>
      prevLinks.map((link) => (link.id === id ? { ...link, name, url } : link))
    );
  };

  const removeLink = (id: number) => {
    setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
  };

  const saveLinksToSupabase = async (userId: string) => {
    const dataToSave = links.reduce<Record<string, { url: string }>>(
      (acc, { name, url }) => {
        if (name.trim() !== "" && url.trim() !== "") {
          acc[name] = { url };
        }
        return acc;
      },
      {} as Record<string, { url: string }>
    );

    const { error } = await supabase
      .from("users")
      .update({ links: dataToSave })
      .eq("uid", userId);

    if (error) {
      console.error("Error saving links to Supabase:", error);
    } else {
      console.log("Links saved successfully in Supabase:", dataToSave);
    }
  };

  if (booleanAuth) {
    return (
      <>
        <div className="home">
          <div className="nav">
            <div className="textBig">hellolink</div>
          </div>
          <div className="main">
            <div className="top">
              <div className="pfp"></div>
              <div className="name">{nameFinal}</div>
              <div className="bio">
                {bioFinal || "Write a short bio about yourself."}
              </div>
              <div className="socials">
                <div className="item">
                  <Github />
                </div>
                <div className="item">
                  <Dribbble />
                </div>
                <div className="item">
                  <Linkedin />
                </div>
                <div className="item">
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
                    <DynamicLink
                      key={link.id}
                      link={link}
                      updateLink={updateLink}
                      removeLink={removeLink}
                    />
                  ))}
                </div>
                <div className="addLink" id="add" onClick={addLink}>
                  <Plus size={45} />
                </div>
                <div
                  className="saveLink"
                  onClick={() => saveLinksToSupabase(finalFetchedUserID)}
                >
                  <Save size={26} /> Save Links
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <>Loading... (authorization unsuccessful)</>;
  }
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
