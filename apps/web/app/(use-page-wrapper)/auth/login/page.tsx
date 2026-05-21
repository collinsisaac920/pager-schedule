import PagerScheduleFlow from "@components/onboarding/PagerScheduleFlow";

export const metadata = {
  title: "Sign in — PagerSchedule",
};

export default function LoginPage() {
  return <PagerScheduleFlow initialTab="signin" />;
}
