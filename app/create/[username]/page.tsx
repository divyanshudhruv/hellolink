"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import "./create.css";
import {
  Codepen,
  CodepenIcon,
  Download,
  Dribbble,
  EditIcon,
  Github,
  Linkedin,
  LogOut,
  Pen,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Avvvatars from "avvvatars-react";
import { supabase } from "@/config/supabase";
import { Toaster } from "sonner";
import { toast } from "sonner";

export default function CreateProfile() {
  const [github, setGithub] = useState("");
  const [dribbble, setDribbble] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [codepen, setCodepen] = useState("");

  const { username } = useParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    uid: "",
    name: "",
    bio: "",
  });

  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [idCounter, setIdCounter] = useState(1);
  const [bio, setBio] = useState(userData?.bio || "");
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
      .eq("id", username)
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
  const saveLinksToSupabase = async () => {
    if (!userData.uid) return;

    const formattedLinks = links
      .filter(({ name, url }) => name.trim() && url.trim()) // Ensure valid entries
      .map(({ name, url }) => ({ name, url })); // Store as an ordered array

    const { error } = await supabase
      .from("users")
      .update({ links: formattedLinks }) // Save as an ordered array
      .eq("uid", userData.uid);

    if (error) console.error("Error saving links:", error);
    else {
      // console.log("Links saved successfully:", formattedLinks);
      toast("Links saved successfully", {
        description: `url: hellolink/${userData.name}`,
        action: {
          label: "Okay",
          onClick: () => console.log("Undo"),
        },
      });
    }
  };

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

  const addLink = () => {
    setLinks([...links, { id: idCounter, name: "", url: "" }]);
    setIdCounter((prev) => prev + 1);
  };

  const updateLink = (id: number, name: string, url: string) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, name, url } : link))
    );
  };

  const removeLink = (id: number) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  if (!isAuthorized) return <>Loading... (authorization unsuccessful)</>;

  async function saveBio() {
    if (!userData.uid) return;
    const { error } = await supabase
      .from("users")
      .update({ bio })
      .eq("uid", userData.uid);

    if (error) console.error("Error saving bio:", error);
    else {
      // console.log("Bio saved successfully:", bio);
      toast("Bio saved successfully", {
        description: `url: hellolink/${userData.name}`,
        action: {
          label: "Okay",
          onClick: () => console.log("Undo"),
        },
      });
    }
  }

  async function getUserBio() {
    const { data, error } = await supabase
      .from("users")
      .select("bio")
      .eq("id", userData.id)
      .single();

    if (error) {
      console.error("Error fetching user bio:", error);
      return null;
    }
    return data;
  }
  async function logOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
    } else {
      console.log("User logged out successfully.");
      window.location.href = "/"; // Redirect to home or login page
    }
  }

  return (
    <>
      {" "}
      <Toaster />
      <div className="home">
        <div className="nav">
          <div className="textBig" onClick={() => (window.location.href = "/")}>
            hellolink
          </div>
          <div className="buttonLogout" onClick={logOut}>
            <LogOut />
          </div>
          <div
            className="button"
            onClick={() => (window.location.href = `/${userData.name}`)}
          >
            View live
          </div>
        </div>
        <div className="main">
          <div className="top">
            <div className="pfp">
              {" "}
              <Avvvatars
                value="devvve235224wqqwrtete"
                style="shape"
                size={100}
              />
            </div>
            <div className="name">@{userData.name}</div>
            <div className="bio">
              {userData.bio || "Write a short bio about yourself."}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="editButton">_E</div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit bio</DialogTitle>
                    <DialogDescription>
                      Make changes to your bio here. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="min-w-full min-h-fit">
                      <Textarea
                        placeholder="Enter your bio..."
                        onChange={(e) => {
                          setUserData((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }));
                          setBio(e.target.value);
                        }}
                        id="textArea"
                        value={userData.bio ?? ""} // Ensure it's not undefined
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button onClick={saveBio}>Save changes</Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="socials">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="item">
                    <Github />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit your social links</DialogTitle>
                    <DialogDescription>
                      Make changes to your social links here. Click save when
                      you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="min-w-full min-h-fit">
                      <Label>Github</Label>
                      <Input
                        placeholder="url"
                        id="github"
                        onChange={(e) => setGithub(e.target.value)}
                      ></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Dribbble</Label>
                      <Input
                        placeholder="url"
                        id="dribbble"
                        onChange={(e) => setDribbble(e.target.value)}
                      ></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Linkedin</Label>
                      <Input
                        placeholder="url"
                        id="linkedin"
                        onChange={(e) => setLinkedin(e.target.value)}
                      ></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Codepen</Label>
                      <Input
                        placeholder="url"
                        id="codepen"
                        onChange={(e) => setCodepen(e.target.value)}
                      ></Input>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button onClick={saveBio}>Save changes</Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="item">
                    <Dribbble />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit your social links</DialogTitle>
                    <DialogDescription>
                      Make changes to your social links here. Click save when
                      you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="min-w-full min-h-fit">
                      <Label>Github</Label>
                      <Input placeholder="url"></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Dribbble</Label>
                      <Input placeholder="url"></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Linkedin</Label>
                      <Input placeholder="url"></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Codepen</Label>
                      <Input placeholder="url"></Input>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button onClick={saveBio}>Save changes</Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="item">
                    <Linkedin />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit your social links</DialogTitle>
                    <DialogDescription>
                      Make changes to your social links here. Click save when
                      you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="min-w-full min-h-fit">
                      <Label>Github</Label>
                      <Input placeholder="url"></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Dribbble</Label>
                      <Input placeholder="url"></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Linkedin</Label>
                      <Input placeholder="url"></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Codepen</Label>
                      <Input placeholder="url"></Input>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button onClick={saveBio}>Save changes</Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="item">
                    <Codepen />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit your social links</DialogTitle>
                    <DialogDescription>
                      Make changes to your social links here. Click save when
                      you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="min-w-full min-h-fit">
                      <Label>Github</Label>
                      <Input placeholder="url"></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Dribbble</Label>
                      <Input placeholder="url"></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Linkedin</Label>
                      <Input placeholder="url"></Input>
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      ></div>{" "}
                      <Label>Codepen</Label>
                      <Input placeholder="url"></Input>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button onClick={saveBio}>Save changes</Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                <Plus size={32} />
              </div>
              <div className="saveLink" onClick={saveLinksToSupabase}>
                <Download size={32} />
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
  updateLink,
  removeLink,
}: {
  link: { id: number; name: string; url: string };
  updateLink: (id: number, name: string, url: string) => void;
  removeLink: (id: number) => void;
}) {
  const logoRef = useRef<number | null>(null);
  const [logoValue, setLogoValue] = useState(link.name || "410dev");

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    updateLink(link.id, link.name, newUrl);

    if (logoRef.current) clearTimeout(logoRef.current);
    logoRef.current = window.setTimeout(() => setLogoValue(newUrl), 500);
  };

  return (
    <div className="link">
      <div className="logo">
        <Avvvatars value={logoValue} style="shape" size={55} />
      </div>
      <div className="input">
        <input
          type="text"
          placeholder="Name"
          value={link.name}
          onChange={(e) => updateLink(link.id, e.target.value, link.url)}
        />
        <div className="separator"></div>
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
