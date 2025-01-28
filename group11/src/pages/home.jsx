import React from "react";

function Home() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background div */}
      <div className="absolute top-0 left-0 z-[-2] h-full w-full rotate-180 transform bg-white bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(252,205,238,.5)_100%)]"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-start px-4 pt-50">
        <div className="max-w-3xl w-full text-6xl font-bold mb-5 text-center">
          Empowering Volunteers, <br />
          Enabling Change
        </div>
        <div className="max-w-3xl w-full text-base text-center mx-auto mb-10">
          At [App Name], we connect passionate volunteers with meaningful
          opportunities, helping non-profits optimize their efforts. Our
          easy-to-use platform ensures seamless event management and matching,
          so every task gets the{" "}
          <a className="underline decoration-[#49b835]">
            right person, at the right time.
          </a>
        </div>

        <div className="w-full mb-10 m-10">
          <div className="grid grid-cols-3 gap-4">
            <div className="aspect-square bg-white-200">Col 1</div>
            <div className="aspect-square bg-white-200">Col 2</div>
            <div className="aspect-square bg-white-200">Col 3</div>
          </div>
        </div>

        <div className="m-10">
          <div className="text-center mb-6">
            <p className="text-lg font-semibold">
              Ready to make a change in your community?
            </p>
          </div>

          <div className="text-center">
            <button className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300">
              Sign Up Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
