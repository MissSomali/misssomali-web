"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Star,
  User,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Ruler,
  FileText,
  Heart,
  Globe,
  Phone,
} from "lucide-react";
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandFacebook,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Photo {
  id: string;
  url: string;
  type: "profile" | "full_body" | "gallery";
}

interface Application {
  id: string;
  applicationNumber: string | null;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  dateOfBirth: string | null;
  educationLevel: string | null;
  occupation: string | null;
  height: number | null;
  skills: string | null;
  languages: string | null;
  motivationWhy: string | null;
  personalStory: string | null;
  goals: string | null;
  bio: string | null;
  instagram: string | null;
  tiktok: string | null;
  facebook: string | null;
  youtube: string | null;
  status: string;
  appliedAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    phone: string | null;
    country: string | null;
    photos: Photo[];
  };
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  draft: { label: "Draft", variant: "secondary" },
  submitted: { label: "Submitted", variant: "default" },
  pending: { label: "Pending", variant: "outline" },
  under_review: { label: "Under Review", variant: "outline", className: "border-amber-500 text-amber-600 dark:text-amber-400" },
  shortlisted: { label: "Shortlisted", variant: "outline", className: "border-purple-500 text-purple-600 dark:text-purple-400" },
  approved: { label: "Approved", variant: "default", className: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  rejected: { label: "Rejected", variant: "destructive" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, variant: "secondary" as const };
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function calculateAge(dobStr: string | null) {
  if (!dobStr) return "—";
  const dob = new Date(dobStr);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    targetStatus: string;
    actionLabel: string;
  }>({ open: false, targetStatus: "", actionLabel: "" });

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${id}`);
      if (!res.ok) {
        throw new Error("Application not found");
      }
      const data = await res.json();
      setApplication(data);
      setSelectedStatus(data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusUpdate = async (statusToApply: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus: statusToApply, notes }),
      });

      if (res.ok) {
        setNotes("");
        setConfirmDialog({ open: false, targetStatus: "", actionLabel: "" });
        await fetchApplication();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating the status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-1 dark:bg-gray-dark">
        <p className="text-dark-6">Application not found or failed to load.</p>
        <Button variant="link" className="mt-4" onClick={() => router.push("/admin/applications")}>
          Back to Applications
        </Button>
      </div>
    );
  }

  const profilePhoto = application.user?.photos?.find((p) => p.type === "profile")?.url;
  const fullBodyPhoto = application.user?.photos?.find((p) => p.type === "full_body")?.url;
  const galleryPhotos = application.user?.photos?.filter((p) => p.type === "gallery") || [];

  const openConfirmDialog = (targetStatus: string, actionLabel: string) => {
    setConfirmDialog({ open: true, targetStatus, actionLabel });
  };

  return (
    <>
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-2 text-sm font-medium text-dark-6 hover:text-primary dark:text-dark-6 dark:hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>
      </div>

      {/* Hero Header */}
      <div className="mb-6 rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {profilePhoto ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-stroke dark:border-dark-3">
                <Image
                  src={profilePhoto}
                  alt={application.fullName || "Profile"}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stroke text-dark-6 dark:bg-dark-3">
                <User className="h-8 w-8" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-heading-5 font-bold text-dark dark:text-white">
                  {application.fullName || application.user?.fullName || "Unnamed Applicant"}
                </h1>
                <StatusBadge status={application.status} />
              </div>
              <p className="mt-1 text-sm text-dark-6 font-mono">
                App #: {application.applicationNumber || "Pending"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20"
              onClick={() => openConfirmDialog("shortlisted", "Shortlist")}
              disabled={application.status === "shortlisted" || updating}
            >
              <Star className="mr-1.5 h-4 w-4 fill-purple-600" /> Shortlist
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              onClick={() => openConfirmDialog("approved", "Approve")}
              disabled={application.status === "approved" || updating}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" /> Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openConfirmDialog("rejected", "Reject")}
              disabled={application.status === "rejected" || updating}
            >
              <XCircle className="mr-1.5 h-4 w-4" /> Reject
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Columns (Applicant Info) */}
        <div className="col-span-1 space-y-6 lg:col-span-2">
          {/* Personal Information */}
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-dark-6" />
                <div>
                  <p className="text-xs text-dark-6">Date of Birth</p>
                  <p className="text-sm font-medium text-dark dark:text-white">
                    {formatDate(application.dateOfBirth)} (Age: {calculateAge(application.dateOfBirth)})
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-dark-6" />
                <div>
                  <p className="text-xs text-dark-6">Phone Number</p>
                  <p className="text-sm font-medium text-dark dark:text-white">
                    {application.phone || application.user?.phone || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-dark-6" />
                <div>
                  <p className="text-xs text-dark-6">City</p>
                  <p className="text-sm font-medium text-dark dark:text-white">
                    {application.city || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-5 w-5 text-dark-6" />
                <div>
                  <p className="text-xs text-dark-6">Country</p>
                  <p className="text-sm font-medium text-dark dark:text-white">
                    {application.country || application.user?.country || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Profiles */}
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
              Social Media Profiles
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <IconBrandInstagram className="mt-0.5 h-5 w-5 text-pink-600 dark:text-pink-400" />
                <div>
                  <p className="text-xs text-dark-6">Instagram</p>
                  {application.instagram ? (
                    <a
                      href={application.instagram.startsWith("http") ? application.instagram : `https://instagram.com/${application.instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {application.instagram}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-destructive">Missing</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IconBrandTiktok className="mt-0.5 h-5 w-5 text-dark dark:text-white" />
                <div>
                  <p className="text-xs text-dark-6">TikTok</p>
                  {application.tiktok ? (
                    <a
                      href={application.tiktok.startsWith("http") ? application.tiktok : `https://tiktok.com/@${application.tiktok.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {application.tiktok}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-destructive">Missing</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IconBrandFacebook className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-dark-6">Facebook</p>
                  {application.facebook ? (
                    <a
                      href={application.facebook.startsWith("http") ? application.facebook : `https://facebook.com/${application.facebook.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {application.facebook}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-dark-6">—</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IconBrandYoutube className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-xs text-dark-6">YouTube</p>
                  {application.youtube ? (
                    <a
                      href={application.youtube.startsWith("http") ? application.youtube : `https://youtube.com/${application.youtube.startsWith("@") ? application.youtube : `user/${application.youtube}`}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {application.youtube}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-dark-6">—</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional / Background */}
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
              Background & Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 h-5 w-5 text-dark-6" />
                <div>
                  <p className="text-xs text-dark-6">Education Level</p>
                  <p className="text-sm font-medium text-dark dark:text-white">
                    {application.educationLevel || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 h-5 w-5 text-dark-6" />
                <div>
                  <p className="text-xs text-dark-6">Occupation</p>
                  <p className="text-sm font-medium text-dark dark:text-white">
                    {application.occupation || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ruler className="mt-0.5 h-5 w-5 text-dark-6" />
                <div>
                  <p className="text-xs text-dark-6">Height</p>
                  <p className="text-sm font-medium text-dark dark:text-white">
                    {application.height ? `${application.height} cm` : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-5 w-5 text-dark-6" />
                <div>
                  <p className="text-xs text-dark-6">Languages</p>
                  <p className="text-sm font-medium text-dark dark:text-white">
                    {application.languages || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-stroke pt-4 dark:border-dark-3">
              <p className="text-xs text-dark-6">Skills & Talents</p>
              <p className="mt-1 text-sm text-dark dark:text-white whitespace-pre-wrap">
                {application.skills || "No skills or talents specified."}
              </p>
            </div>
          </div>

          {/* Motivation & Bio */}
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
              Motivation & Story
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-dark font-medium dark:text-white mb-1">
                  <Heart className="h-4 w-4 text-primary fill-primary" />
                  <span className="text-sm font-semibold">Why do you want to join Miss Somali?</span>
                </div>
                <p className="text-sm text-dark-6 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg dark:bg-dark-2">
                  {application.motivationWhy || "—"}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-dark font-medium dark:text-white mb-1">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Personal Story & Background</span>
                </div>
                <p className="text-sm text-dark-6 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg dark:bg-dark-2">
                  {application.personalStory || "—"}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-dark font-medium dark:text-white mb-1">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Future Goals & Aspirations</span>
                </div>
                <p className="text-sm text-dark-6 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg dark:bg-dark-2">
                  {application.goals || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Photos & Review Actions) */}
        <div className="space-y-6">
          {/* Review Actions Card */}
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
              Review Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Application Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Review Notes / Notification Message
                </label>
                <Textarea
                  placeholder="Provide feedback or reasons for status change... This will be sent to the applicant."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => handleStatusUpdate(selectedStatus)}
                disabled={selectedStatus === application.status || updating}
              >
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Status
              </Button>
            </div>
          </div>

          {/* Photos Card */}
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
              Uploaded Photos
            </h3>
            <div className="space-y-4">
              {profilePhoto ? (
                <div>
                  <p className="mb-2 text-xs font-semibold text-dark-6">Profile Photo</p>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-stroke dark:border-dark-3">
                    <Image
                      src={profilePhoto}
                      alt="Profile Photo"
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-stroke dark:border-dark-3">
                  <p className="text-sm text-dark-6">No profile photo uploaded</p>
                </div>
              )}

              {fullBodyPhoto ? (
                <div>
                  <p className="mb-2 text-xs font-semibold text-dark-6">Full Body Photo</p>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-stroke dark:border-dark-3">
                    <Image
                      src={fullBodyPhoto}
                      alt="Full Body Photo"
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-stroke dark:border-dark-3">
                  <p className="text-sm text-dark-6">No full body photo uploaded</p>
                </div>
              )}

              {galleryPhotos.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-dark-6 font-medium">Gallery Photos</p>
                  <div className="grid grid-cols-2 gap-2">
                    {galleryPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative aspect-[3/4] overflow-hidden rounded-lg border border-stroke dark:border-dark-3"
                      >
                        <Image
                          src={photo.url}
                          alt="Gallery Photo"
                          fill
                          sizes="150px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog((d) => ({ ...d, open: false }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.actionLabel} Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmDialog.actionLabel.toLowerCase()} the application for{" "}
              <strong>{application.fullName || application.user?.fullName}</strong>? This will transition their status to{" "}
              <strong>{confirmDialog.targetStatus}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <label className="block text-sm font-medium text-dark dark:text-white">
              Optional feedback or notes to candidate:
            </label>
            <Textarea
              placeholder="E.g., Congratulations! You have been shortlisted..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, targetStatus: "", actionLabel: "" })}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.targetStatus === "rejected" ? "destructive" : "default"}
              onClick={() => handleStatusUpdate(confirmDialog.targetStatus)}
              disabled={updating}
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm {confirmDialog.actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
