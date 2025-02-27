import React from "react";
import { UserCheck, CheckSquare, CalendarRange } from "lucide-react";

function Home() {
  return (
    <>
      <div className="fixed top-0 left-0 z-[-1] h-full w-full rotate-180 bg-gradient-to-b from-emerald-600 to-emerald-900"></div>

      <div className="relative min-h-screen w-full text-white">
        <div className="relative z-10 flex flex-col items-center justify-start px-4 pt-50">
          <div className="max-w-3xl w-full text-6xl font-bold mb-5 text-center">
            Empowering Volunteers, <br />
            Enabling&nbsp;
            <span className="inline-block text-[#E8CDA2]">Change</span>
          </div>
          <div className="max-w-3xl w-full text-base text-center mx-auto mb-10">
            At [App Name], we connect passionate volunteers with meaningful
            opportunities, helping non-profits optimize their efforts. Our
            easy-to-use platform ensures seamless event management and matching,
            so every task gets the{" "}
            <a className="underline decoration-[#E8CDA2]">
              right person, at the right time.
            </a>
          </div>

          <div className="w-full mb-10 m-10 p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F8F9FA] text-black p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <CalendarRange className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">For Volunteers</h3>
                <p className="text-sm text-gray-600">
                  Find meaningful volunteer opportunities that match your skills
                  and interests. Browse local events, track your impact, and
                  connect with causes you care about.
                </p>
              </div>

              <div className="bg-[#F8F9FA] text-black p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <UserCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  For Organizations
                </h3>
                <p className="text-sm text-gray-600">
                  Manage volunteers efficiently with our comprehensive
                  dashboard. Track skills, availability, and engagement while
                  coordinating events seamlessly.
                </p>
              </div>

              <div className="bg-[#F8F9FA] text-black p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <CheckSquare className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Matching</h3>
                <p className="text-sm text-gray-600">
                  Our intelligent matching system pairs volunteers with
                  opportunities based on skills, interests, and availability,
                  maximizing impact for everyone involved.
                </p>
              </div>
            </div>
          </div>

          <div className="m-10">
            <div className="text-center mb-6">
              <p className="text-lg font-semibold">
                Ready to make a change in your community?
              </p>
            </div>

            <div className="text-center">
              <button className="px-8 py-3 bg-emerald-800 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300">
                Sign Up Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
