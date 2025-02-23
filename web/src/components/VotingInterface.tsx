import { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'

interface Proposal {
  id: number
  title: string
  description: string
  votesFor: number
  votesAgainst: number
  endTime: number
}

export default function VotingInterface({ user }: { user: any }) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    endTime: ''
  })

  const createProposal = async () => {
    try {
      const transactionId = await fcl.mutate({
        cadence: `import Voting from 0xVOTING_CONTRACT_ADDRESS
        
        transaction(title: String, description: String, endTime: UFix64) {
          prepare(signer: AuthAccount) {}
          execute {
            Voting.createProposal(title: title, description: description, endTime: endTime)
          }
        }`,
        args: (arg: any, t: any) => [
          arg(newProposal.title, t.String),
          arg(newProposal.description, t.String),
          arg(newProposal.endTime, t.UFix64)
        ],
        limit: 999
      })

      const transaction = await fcl.tx(transactionId).onceSealed()
      console.log(transaction)
      fetchProposals()
    } catch (error) {
      console.error(error)
    }
  }

  const castVote = async (proposalId: number, voteFor: boolean) => {
    try {
      const transactionId = await fcl.mutate({
        cadence: `import Voting from 0xVOTING_CONTRACT_ADDRESS
        
        transaction(proposalId: UInt64, voteFor: Bool) {
          prepare(signer: AuthAccount) {}
          execute {
            Voting.vote(proposalId: proposalId, voteFor: voteFor)
          }
        }`,
        args: (arg: any, t: any) => [
          arg(proposalId, t.UInt64),
          arg(voteFor, t.Bool)
        ],
        limit: 999
      })

      const transaction = await fcl.tx(transactionId).onceSealed()
      console.log(transaction)
      fetchProposals()
    } catch (error) {
      console.error(error)
    }
  }

  const fetchProposals = async () => {
    try {
      const result = await fcl.query({
        cadence: `import Voting from 0xVOTING_CONTRACT_ADDRESS

        pub fun main(): {UInt64: Voting.Proposal} {
          return Voting.proposals
        }`
      })
      setProposals(Object.values(result))
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (user.loggedIn) {
      fetchProposals()
    }
  }, [user])

  return (
    <div>
      {user.loggedIn && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Create New Proposal</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full p-2 border rounded"
                value={newProposal.title}
                onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 border rounded"
                value={newProposal.description}
                onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
              />
              <input
                type="datetime-local"
                className="w-full p-2 border rounded"
                onChange={(e) => setNewProposal({ ...newProposal, endTime: new Date(e.target.value).getTime().toString() })}
              />
              <button
                onClick={createProposal}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Create Proposal
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {proposals.map((proposal: Proposal) => (
              <div key={proposal.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold">{proposal.title}</h3>
                <p className="mt-2">{proposal.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <span className="text-green-500">For: {proposal.votesFor}</span>
                    <span className="mx-4">|</span>
                    <span className="text-red-500">Against: {proposal.votesAgainst}</span>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => castVote(proposal.id, true)}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Vote For
                    </button>
                    <button
                      onClick={() => castVote(proposal.id, false)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Vote Against
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}