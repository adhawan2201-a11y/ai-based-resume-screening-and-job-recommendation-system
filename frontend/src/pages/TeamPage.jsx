import { FiUsers, FiMail, FiLinkedin } from 'react-icons/fi';

export default function TeamPage() {
  const members = [
    { name: 'Abhishek Dhawan', role: 'Core Development' },
    { name: 'Ammar Ahmad', role: 'System Architecture' },
    { name: 'Abhinav Shukla', role: 'Data Intelligence' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-semibold text-white tracking-tight mb-4">Team</h1>
        <div className="w-12 h-1 bg-dark-700 mx-auto"></div>
      </div>

      <div className="grid gap-8">
        {members.map((member, i) => (
          <div key={i} className="glass-card p-8 flex items-center justify-between group hover:border-white/20 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-dark-800 flex items-center justify-center border border-white/10 text-2xl font-bold text-dark-300">
                {member.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-medium text-white">{member.name}</h3>
                <p className="text-dark-400 text-sm mt-1">{member.role}</p>
              </div>
            </div>
            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-dark-400 hover:text-white transition-colors"><FiLinkedin /></button>
              <button className="text-dark-400 hover:text-white transition-colors"><FiMail /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 text-center border-t border-white/5 pt-12">
        <p className="text-dark-500 text-sm">Project Development Team</p>
      </div>
    </div>
  );
}
